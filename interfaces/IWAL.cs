namespace JOEX_DB_Engine.Interfaces
{
    public interface IWAL
    {
        void Append(string key, string value);
        void Delete(string key);
        void Recover();
    }
}