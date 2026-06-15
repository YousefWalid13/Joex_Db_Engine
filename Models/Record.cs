namespace JOEX_DB_Engine.Models
{
    public class Record
    {
        public string Key { get; set; } = string.Empty;

        public string Value { get; set; } = string.Empty;

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public bool IsDeleted { get; set; } = false;
    }
}