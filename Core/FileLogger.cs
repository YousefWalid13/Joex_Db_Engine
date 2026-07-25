namespace JOEX_DB_Engine.Engine;

public class FileLogger
{
    private readonly string _logPath = "Logs/engine.log";

    public FileLogger()
    {
        Directory.CreateDirectory("Logs");

        if (!File.Exists(_logPath))
            File.Create(_logPath).Dispose();
    }

    public void Log(string level, string message)
    {
        var line =
            $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] [{level}] {message}";

        File.AppendAllLines(_logPath, new[] { line });
    }

    public IEnumerable<string> GetLogs(int take = 100)
    {
        if (!File.Exists(_logPath))
            return Enumerable.Empty<string>();

        return File.ReadLines(_logPath)
            .Reverse()
            .Take(take)
            .Reverse();
    }
}