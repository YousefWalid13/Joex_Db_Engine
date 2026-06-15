namespace JOEX_DB_Engine.Storage
{
    public sealed class IndexEntry
    {
        public string Key { get; }
        public long Offset { get; }

        public IndexEntry(string key, long offset)
        {
            ArgumentException.ThrowIfNullOrEmpty(key);
            ArgumentOutOfRangeException.ThrowIfNegative(offset);

            Key = key;
            Offset = offset;
        }

        public override string ToString() => $"[{Key} → offset {Offset}]";
    }
}