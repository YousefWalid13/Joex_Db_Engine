namespace JOEX_DB_Engine.Interfaces
{
    public interface IMemTable
    {
        void Set(string key, string value);

        bool TryGet(string key, out string value);

        void Clear();

        int Count { get; }
    }
}