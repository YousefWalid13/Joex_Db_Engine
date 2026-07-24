namespace JOEX_DB_Engine.Controllers;

using JOEX_DB_Engine.Engine;
using JOEX_DB_Engine.Interfaces;
using JOEX_DB_Engine.Storage.LsmData;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/engine")]
public class EngineController : ControllerBase
{
    private readonly IDatabase _database;
    private readonly IMemTable _memTable;
    private readonly EngineStatistics _stats;
    private readonly FileLogger _logger;
    private readonly IConfiguration _configuration;
    private readonly LsmEngine _lsmEngine; // ADDED

    public EngineController(
        IDatabase database,
        IMemTable memTable,
        EngineStatistics stats,
        IConfiguration configuration,
        FileLogger logger,
        LsmEngine lsmEngine) // ADDED
    {
        _database = database;
        _memTable = memTable;
        _stats = stats;
        _configuration = configuration;
        _logger = logger;
        _lsmEngine = lsmEngine; // ADDED
    }
    [HttpPost("start")]
    public IActionResult Start()
    {
        _lsmEngine.Start();

        _logger.Log("INFO", "Engine started.");

        return Ok(new
        {
            Message = "Engine started successfully."
        });
    }

    [HttpPost("stop")]
    public IActionResult Stop()
    {
        _lsmEngine.Stop();

        _logger.Log("INFO", "Engine stopped.");

        return Ok(new
        {
            Message = "Engine stopped successfully."
        });
    }
    [HttpGet("memtable")]
    public IActionResult MemTable()
    {
        var count = _lsmEngine.GetMemTable().Count; // CHANGED from _memTable.Count
        return Ok(new
        {
            Count = count,
            Capacity = 1000,
            Usage = (count / 1000.0) * 100
        });
    }

    [HttpGet("wal")]
    public IActionResult WAL()
    {
        // CHANGED: read LsmEngine's own wal.log (under lsmDataDir), not
        // Database:WALPath which belongs to the old engine.
        var lsmDataDir = _configuration["Database:LsmDirectory"] ?? "Storage/LsmData";
        var wal = Path.Combine(lsmDataDir, "wal.log");
        if (!System.IO.File.Exists(wal))
            return Ok(Array.Empty<string>());
        return Ok(new FileInfo(wal).Length > 0
            ? new[] { $"{new FileInfo(wal).Length} bytes (binary WAL, not line-based)" }
            : Array.Empty<string>());
    }
    [HttpGet("status")]
    public IActionResult Status()
    {
        var walPath = _configuration["Database:WALPath"]!;
        var dbPath = _configuration["Database:Path"]!;
        var sstableDir = _configuration["Database:SSTableDirectory"]!;

        var result = new
        {
            Status = "Running",

            StartedAt = _stats.StartedAt,

            Uptime = (DateTime.UtcNow - _stats.StartedAt).ToString(),

            MemTableRecords = _memTable.Count,

            SSTableCount = Directory
                .GetFiles(sstableDir, "*.sst")
                .Length,

            WalSize = System.IO.File.Exists(walPath)
                ? new FileInfo(walPath).Length
                : 0,

            DatabaseSize = System.IO.File.Exists(dbPath)
                ? new FileInfo(dbPath).Length
                : 0,

            FlushCount = _stats.FlushCount,

            CompactionCount = _stats.CompactionCount
        };

        return Ok(result);
    }

    [HttpGet("sstables")]
    public IActionResult SSTables()
    {
        var dir = _configuration["Database:SSTableDirectory"]!;

        if (!Directory.Exists(dir))
        {
            return NotFound($"SSTable directory not found: {dir}");
        }

        try
        {
            var files = Directory
                .GetFiles(dir, "*.sst")
                .Select(file =>
                {
                    var info = new FileInfo(file);
                    return new
                    {
                        Name = info.Name,
                        Size = info.Length,
                        Created = info.CreationTimeUtc
                    };
                })
                .OrderByDescending(f => f.Created)
                .ToList();

            return Ok(files);
        }
        catch (IOException ex)
        {
            return StatusCode(500, $"Error reading SSTable directory: {ex.Message}");
        }
    }


    [HttpPost("flush")]
    public IActionResult Flush()
    {
        _lsmEngine.Flush();

        _stats.FlushCount++;

        return Ok(new
        {
            Message = "MemTable flushed successfully."
        });
    }
    [HttpPost("compact")]
    public IActionResult Compact()
    {
        try
        {
            _lsmEngine.Compact();

            _stats.CompactionCount++;

            _logger.Log("INFO", "Compaction completed successfully.");

            return Ok(new
            {
                Message = "Compaction completed successfully."
            });
        }
        catch (Exception ex)
        {
            _logger.Log("ERROR", $"Compaction failed: {ex.Message}");

            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                Message = "Compaction failed.",
                Error = ex.Message
            });
        }
    }
}