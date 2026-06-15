using JOEX_DB_Engine.Storage;

public class SparseIndex
{
    private readonly List<IndexEntry> _entries = new();

    public void Add(string key, long offset)
    {
        _entries.Add(new IndexEntry(key, offset));
    }

    public long FindNearestOffset(string key)
    {
        long offset = 0;

        foreach (var entry in _entries)
        {
            if (string.Compare(entry.Key, key,
                    StringComparison.Ordinal) > 0)
                break;

            offset = entry.Offset;
        }

        return offset;
    }

    public IReadOnlyList<IndexEntry> Entries => _entries;
}