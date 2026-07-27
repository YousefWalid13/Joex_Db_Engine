namespace JOEX_DB_Engine.Storage.LsmData;

public class WalEntry
{
    public DateTime Timestamp { get; set; }
    public string Op { get; set; } = string.Empty;
    public string? Key { get; set; }
    public string? Value { get; set; }
}
