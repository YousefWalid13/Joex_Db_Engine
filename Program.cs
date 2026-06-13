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

            // Swagger
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // Database Engine
            builder.Services.AddSingleton<IDatabase>(
                new Database("database.db"));

            var app = builder.Build();

            var db = app.Services.GetRequiredService<IDatabase>();
            db.Load();

            // Swagger UI
            app.UseSwagger();
            app.UseSwaggerUI();

            app.UseHttpsRedirection();

            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}