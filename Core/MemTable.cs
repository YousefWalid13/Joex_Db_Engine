using JOEX_DB_Engine.Interfaces;

namespace JOEX_DB_Engine.Core
{
    public class MemTable : IMemTable
    {
        private readonly SortedDictionary<string, string> _data = new();

        public void Set(string key, string value)
        {
            _data[key] = value;
        }

        public bool TryGet(string key, out string value)
        {
            return _data.TryGetValue(key, out value!);
        }

        public void Clear()
        {
            _data.Clear();
        }

        public int Count => _data.Count;

        public IReadOnlyDictionary<string, string> Data => _data;
    }
}