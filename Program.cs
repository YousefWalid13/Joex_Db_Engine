using JOEX_DB_Engine.Core;
using JOEX_DB_Engine.Engine;
using JOEX_DB_Engine.Interfaces;
using JOEX_DB_Engine.Storage.LsmData;
using System.Reflection;

namespace JOEX_DB_Engine;

public class Program
{
    public static void Main(string[] args)
    {
        try
        {
            RunApp(args);
        }
        catch (ReflectionTypeLoadException ex)
        {
            Console.WriteLine("ReflectionTypeLoadException:");

            foreach (var loader in ex.LoaderExceptions)
                Console.WriteLine(loader);

            throw;
        }
    }

    private static void RunApp(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        var dbPath = builder.Configuration["Database:Path"]
                     ?? throw new InvalidOperationException("Database:Path is missing.");

        var sstableDir = builder.Configuration["Database:SSTableDirectory"]
                          ?? "Storage/SSTables";

        var walPath = builder.Configuration["Database:WALPath"]
                       ?? "Storage/WAL/wal.log";

        var lsmDataDir = builder.Configuration["Database:LsmDirectory"]
                          ?? "Storage/LsmData";

        Directory.CreateDirectory(lsmDataDir);
        Directory.CreateDirectory(sstableDir);

        var walDir = Path.GetDirectoryName(walPath);
        if (!string.IsNullOrWhiteSpace(walDir))
            Directory.CreateDirectory(walDir);

        // Legacy services (if EngineController still uses them)
        builder.Services.AddSingleton<IDatabase>(_ =>
            new Database(dbPath));

        builder.Services.AddSingleton<IMemTable, MemTable>();

        builder.Services.AddSingleton<EngineStatistics>();

        builder.Services.AddSingleton<FileLogger>();


        // Main storage engine
        builder.Services.AddSingleton<LsmEngine>(_ =>
            new LsmEngine(lsmDataDir));

        var app = builder.Build();

        // Initialize database
        try
        {
            var database = app.Services.GetRequiredService<IDatabase>();
            database.Load();

            app.Logger.LogInformation("Database loaded successfully.");
        }
        catch (Exception ex)
        {
            app.Logger.LogCritical(ex, "Database failed to load.");
            return;
        }

        // Initialize LSM Engine
        try
        {
            app.Services.GetRequiredService<LsmEngine>();

            app.Logger.LogInformation("LSM Engine initialized.");
        }
        catch (Exception ex)
        {
            app.Logger.LogCritical(ex, "LSM Engine initialization failed.");
            return;
        }

       
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseHttpsRedirection();
        app.UseAuthorization();

        app.MapControllers();

        app.Run();
    }
}