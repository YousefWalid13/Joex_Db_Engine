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
        var memTableEntries = _lsmEngine.GetMemTable();
        var sizeBytes = _lsmEngine.GetMemTableSizeBytes();
        var maxBytes = 10 * 1024 * 1024; // 10 MB limit for demo/threshold
        var count = memTableEntries.Count;
        var entries = memTableEntries
            .Select(kvp => new { key = kvp.Key, value = kvp.Value })
            .ToList();

        return Ok(new
        {
            SizeBytes = sizeBytes,
            MaxBytes = maxBytes,
            RecordCount = count,
            Count = count,
            Capacity = 1000,
            Usage = (count / 1000.0) * 100,
            Entries = entries,
            EntriesMap = memTableEntries
        });
    }

    [HttpGet("wal")]
    public IActionResult WAL()
    {
        return Ok(_lsmEngine.ReadWal());
    }

    [HttpGet("status")]
    public IActionResult Status()
    {
        var lsmDataDir = _configuration["Database:LsmDirectory"] ?? "Storage/LsmData";
        var walPath = Path.Combine(lsmDataDir, "wal.log");
        var sstableDir = _configuration["Database:SSTableDirectory"] ?? lsmDataDir;

        long sstableSize = 0;
        int sstableCount = 0;
        if (Directory.Exists(sstableDir))
        {
            var sstFiles = Directory.GetFiles(sstableDir, "*.sst");
            sstableCount = sstFiles.Length;
            foreach (var file in sstFiles)
            {
                sstableSize += new FileInfo(file).Length;
            }
        }

        long walSize = System.IO.File.Exists(walPath) ? new FileInfo(walPath).Length : 0;
        long totalDiskUsage = sstableSize + walSize;

        var memtable = _lsmEngine.GetMemTable();
        var memtableSize = _lsmEngine.GetMemTableSizeBytes();
        var memtableMaxBytes = 10 * 1024 * 1024; // 10 MB

        var result = new
        {
            Status = "Running",
            IsRunning = true,
            StartedAt = _stats.StartedAt,
            Uptime = (DateTime.UtcNow - _stats.StartedAt).ToString(),
            MemTableRecords = memtable.Count,
            MemtableSizeBytes = memtableSize,
            MemtableMaxBytes = memtableMaxBytes,
            SSTableCount = sstableCount,
            WalSize = walSize,
            DiskUsageBytes = totalDiskUsage,
            DatabaseSize = totalDiskUsage,
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
            var compacted = _lsmEngine.Compact();

            _stats.CompactionCount++;

            _logger.Log("INFO", compacted
                ? "Compaction completed successfully."
                : "Compaction skipped because there was nothing to merge.");

            return Ok(new
            {
                Message = compacted
                    ? "Compaction completed successfully."
                    : "Compaction skipped because there was nothing to merge."
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