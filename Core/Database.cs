using JOEX_DB_Engine.Interfaces;
using JOEX_DB_Engine.Storage;
using JOEX_DB_Engine.Storage.LsmData;

namespace JOEX_DB_Engine.Engine
{
    public class Database : IDatabase
    {
        private Dictionary<string, object> _data;
        private readonly DataFile _dataFile;
        private readonly LsmEngine _lsmEngine;

        public Database(string filePath)
        {
            _dataFile = new DataFile(filePath);
            _data = new Dictionary<string, object>();
            _lsmEngine = new LsmEngine(); // Initialize LsmEngine
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
            _lsmEngine.Flush(); // Flush data to LSM engine
        }

        public void Load()
        {
            // read from disk
            _data = _dataFile.Load();
        }
    }
}