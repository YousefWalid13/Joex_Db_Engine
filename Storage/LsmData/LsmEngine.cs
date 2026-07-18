using System.Collections.Concurrent;

namespace JOEX_DB_Engine.Storage.LsmData
{
    // Internal wrapper so the MemTable can represent "this key was deleted"
    // distinctly from "this key was never here" — needed for correct
    // shadowing once older values exist in an SSTable on disk.
    internal class MemTableEntry
    {
        public string? Value { get; set; }
        public bool IsDeleted { get; set; }
    }

    public class LsmEngine
    {
        private readonly ConcurrentDictionary<string, MemTableEntry> _memTable;
        private readonly List<string> _sstableFiles; // ordered oldest -> newest
        private readonly string _dataDirectory;
        private readonly object _sstableLock = new();
        private readonly string _walPath;
        private readonly object _walLock = new();
        private int _sstableCounter;

        public LsmEngine(string dataDirectory = "data")
        {
            _memTable = new ConcurrentDictionary<string, MemTableEntry>();
            _sstableFiles = new List<string>();
            _dataDirectory = dataDirectory;
            Directory.CreateDirectory(_dataDirectory);

            _walPath = Path.Combine(_dataDirectory, "wal.log");

            // Recover any SSTables left over from a previous run, oldest first,
            // so file names (and therefore recency order) sort correctly.
            foreach (var file in Directory.GetFiles(_dataDirectory, "sstable_*.sst")
                                           .OrderBy(f => f, StringComparer.Ordinal))
            {
                _sstableFiles.Add(file);
            }
            _sstableCounter = _sstableFiles.Count;

            // Replay any writes left in the WAL from a previous run that
            // never made it into an SSTable (e.g. crash before a Flush).
            if (File.Exists(_walPath))
            {
                using var stream = new FileStream(_walPath, FileMode.Open, FileAccess.Read);
                using var reader = new BinaryReader(stream);
                while (stream.Position < stream.Length)
                {
                    var key = reader.ReadString();
                    var isDeleted = reader.ReadBoolean();
                    var value = reader.ReadString();
                    _memTable[key] = new MemTableEntry { Value = isDeleted ? null : value, IsDeleted = isDeleted };
                }
            }
        }

        private void AppendToWal(string key, string? value, bool isDeleted)
        {
            lock (_walLock)
            {
                using var stream = new FileStream(_walPath, FileMode.Append, FileAccess.Write);
                using var writer = new BinaryWriter(stream);
                writer.Write(key);
                writer.Write(isDeleted);
                writer.Write(value ?? string.Empty);
            }
        }

        public void Put(string key, string value)
        {
            if (string.IsNullOrWhiteSpace(key))
                throw new ArgumentException("Key cannot be empty.");

            AppendToWal(key, value, isDeleted: false);
            _memTable[key] = new MemTableEntry { Value = value, IsDeleted = false };
        }

        public GetResult Get(string key)
        {
            if (string.IsNullOrWhiteSpace(key))
                return new GetResult { Found = false };

            // 1. The MemTable always has the freshest data for a key.
            if (_memTable.TryGetValue(key, out var entry))
            {
                return entry.IsDeleted
                    ? new GetResult { Found = false, Key = key }
                    : new GetResult { Found = true, Key = key, Value = entry.Value };
            }

            // 2. Fall back to SSTables, newest first, so the most recent
            //    flush wins if the key exists in more than one file.
            lock (_sstableLock)
            {
                for (int i = _sstableFiles.Count - 1; i >= 0; i--)
                {
                    if (TryReadFromSSTable(_sstableFiles[i], key, out var value, out var isDeleted))
                    {
                        return isDeleted
                            ? new GetResult { Found = false, Key = key }
                            : new GetResult { Found = true, Key = key, Value = value };
                    }
                }
            }

            return new GetResult { Found = false, Key = key };
        }

        public void Delete(string key)
        {
            if (string.IsNullOrWhiteSpace(key))
                return;

            // Don't just remove the key: if an older value already lives in an
            // SSTable, removing it from the MemTable alone would let that old
            // value "reappear" on the next Get(). Write a tombstone instead.
            AppendToWal(key, null, isDeleted: true);
            _memTable[key] = new MemTableEntry { Value = null, IsDeleted = true };
        }

        public IReadOnlyDictionary<string, string> GetMemTable()
        {
            return _memTable
                .Where(kvp => !kvp.Value.IsDeleted)
                .ToDictionary(kvp => kvp.Key, kvp => kvp.Value.Value ?? string.Empty);
        }
 

        public void Flush()
        {
            if (_memTable.IsEmpty)
                return;

            // Snapshot then clear. Anything Put/Deleted after this point lands
            // in the now-empty MemTable, so nothing written during the flush
            // gets lost or silently overwritten.
            var snapshot = new Dictionary<string, MemTableEntry>(_memTable);
            foreach (var key in snapshot.Keys)
            {
                _memTable.TryRemove(key, out _);
            }

            var sortedEntries = snapshot.OrderBy(kvp => kvp.Key, StringComparer.Ordinal);

            lock (_sstableLock)
            {
                var fileName = $"sstable_{_sstableCounter:D6}.sst";
                var path = Path.Combine(_dataDirectory, fileName);
                _sstableCounter++;

                WriteSSTable(path, sortedEntries);
                _sstableFiles.Add(path);
            }

            // The MemTable is now durably saved in an SSTable, so the WAL
            // entries that led up to it are no longer needed for recovery.
            lock (_walLock)
            {
                File.WriteAllBytes(_walPath, Array.Empty<byte>());
            }
        }

        public void Compact()
        {
            lock (_sstableLock)
            {
                if (_sstableFiles.Count <= 1)
                    return;

                // Walk oldest -> newest so later files overwrite earlier ones
                // for any key that appears in more than one SSTable.
                var merged = new SortedDictionary<string, MemTableEntry>(StringComparer.Ordinal);

                foreach (var file in _sstableFiles)
                {
                    foreach (var (key, value, isDeleted) in ReadSSTable(file))
                    {
                        merged[key] = new MemTableEntry { Value = value, IsDeleted = isDeleted };
                    }
                }

                // This merge covers every SSTable we have, so a tombstone has
                // nothing left to shadow — safe to drop it from the output.
                var liveEntries = merged.Where(kvp => !kvp.Value.IsDeleted);

                var mergedFileName = $"sstable_{_sstableCounter:D6}.sst";
                var mergedPath = Path.Combine(_dataDirectory, mergedFileName);
                _sstableCounter++;

                WriteSSTable(mergedPath, liveEntries);

                foreach (var oldFile in _sstableFiles)
                {
                    File.Delete(oldFile);
                }

                _sstableFiles.Clear();
                _sstableFiles.Add(mergedPath);
            }
        }

        private static void WriteSSTable(string path, IEnumerable<KeyValuePair<string, MemTableEntry>> entries)
        {
            using var stream = new FileStream(path, FileMode.Create, FileAccess.Write);
            using var writer = new BinaryWriter(stream);

            foreach (var kvp in entries)
            {
                writer.Write(kvp.Key);
                writer.Write(kvp.Value.IsDeleted);
                writer.Write(kvp.Value.Value ?? string.Empty);
            }
        }

        private static IEnumerable<(string Key, string? Value, bool IsDeleted)> ReadSSTable(string path)
        {
            using var stream = new FileStream(path, FileMode.Open, FileAccess.Read);
            using var reader = new BinaryReader(stream);

            while (stream.Position < stream.Length)
            {
                var key = reader.ReadString();
                var isDeleted = reader.ReadBoolean();
                var value = reader.ReadString();
                yield return (key, isDeleted ? null : value, isDeleted);
            }
        }

        private static bool TryReadFromSSTable(string path, string key, out string? value, out bool isDeleted)
        {
            // Linear scan — simple and correct. A production engine would add
            // a sparse in-memory index (or bloom filter) per SSTable so most
            // files can be skipped without a full read.
            foreach (var (k, v, deleted) in ReadSSTable(path))
            {
                if (k == key)
                {
                    value = v;
                    isDeleted = deleted;
                    return true;
                }
            }

            value = null;
            isDeleted = false;
            return false;
        }
    }

    public class GetResult
    {
        public bool Found { get; set; }
        public string? Key { get; set; }
        public string? Value { get; set; }
    }
}