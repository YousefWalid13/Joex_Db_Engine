namespace JOEX_DB_Engine.Interfaces
{
    public interface IDatabase
    {
        void Set(string key, object value);

        object? Get(string key);

        bool Delete(string key);

        void Save();

        void Load();
    }
}