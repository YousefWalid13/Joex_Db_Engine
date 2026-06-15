    using JOEX_DB_Engine.Engine;
    using JOEX_DB_Engine.Interfaces;

    namespace JOEX_DB_Engine
    {
        public class Program
        {
            public static void Main(string[] args)
            {
                var builder = WebApplication.CreateBuilder(args);

                builder.Services.AddControllers();
                builder.Services.AddEndpointsApiExplorer();
                builder.Services.AddSwaggerGen();

                // Path comes from config — set in appsettings.json, overridable per environment
                var dbPath = builder.Configuration["Database:Path"]
                    ?? throw new InvalidOperationException(
                        "Database:Path is not configured. Add it to appsettings.json.");

                builder.Services.AddSingleton<IDatabase>(_ => new Database(dbPath));

                var app = builder.Build();

                // Load existing data from disk before accepting requests
                var db = app.Services.GetRequiredService<IDatabase>();
                try
                {
                    db.Load();
                    app.Logger.LogInformation("Database loaded successfully from {Path}", dbPath);
                }
                catch (Exception ex)
                {
                    app.Logger.LogCritical(ex, "Failed to load database from {Path}. Shutting down.", dbPath);
                    return; // abort startup cleanly instead of crashing mid-pipeline
                }

                // Swagger only in development
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
    }