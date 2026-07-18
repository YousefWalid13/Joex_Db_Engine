namespace JOEX_DB_Engine.Engine;

public class EngineStatistics
{
    public DateTime StartedAt { get; } = DateTime.UtcNow;

    public int FlushCount { get; set; }

    public int CompactionCount { get; set; }

    public int TotalRequests { get; set; }
}