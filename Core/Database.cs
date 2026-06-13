using JOEX_DB_Engine.Interfaces;
using JOEX_DB_Engine.Storage;

namespace JOEX_DB_Engine.Engine
{
    public class Database : IDatabase
    {
        private Dictionary<string, object> _data;
        private readonly DataFile _dataFile;

        public Database(string filePath)
        {
            _dataFile = new DataFile(filePath);
            _data = new Dictionary<string, object>();
        }

        public void Set(string key, object value)
        {
            _data[key] = value;
        }

        public object? Get(string key)
        {
            return _data.TryGetValue(key, out var value)
                ? value
                : null;
        }

        public bool Delete(string key)
        {
            return _data.Remove(key);
        }

        public void Save()
        {
            // write to disk
            _dataFile.Save(_data);
        }

        public void Load()
        {
            // read from disk
            _data = _dataFile.Load();
        }
    }
}