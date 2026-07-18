namespace JOEX_DB_Engine.Models;

public class EngineStatusDto
{
    public string Status { get; set; } = "Running";

    public DateTime StartedAt { get; set; }

    public TimeSpan Uptime => DateTime.UtcNow - StartedAt;

    public int MemTableRecords { get; set; }

    public int MemTableCapacity { get; set; }

    public int SSTableCount { get; set; }

    public long WalSize { get; set; }

    public long DatabaseSize { get; set; }

    public int FlushCount { get; set; }

    public int CompactionCount { get; set; }
}