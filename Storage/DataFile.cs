using System.Text.Json;

namespace JOEX_DB_Engine.Storage
{
    public class DataFile
    {
        private readonly string _filePath;

        public DataFile(string filePath)
        {
            _filePath = filePath;

            if (!File.Exists(_filePath))
            {
                File.WriteAllText(_filePath, "{}");
            }
        }

        public void Save(Dictionary<string, object> data)
        {
            string json = JsonSerializer.Serialize(
                data,
                new JsonSerializerOptions
                {
                    WriteIndented = true
                });

            File.WriteAllText(_filePath, json);
        }

        public Dictionary<string, object> Load()
        {
            string json = File.ReadAllText(_filePath);

            if (string.IsNullOrWhiteSpace(json))
                return new Dictionary<string, object>();

            return JsonSerializer.Deserialize<Dictionary<string, object>>(json)
                   ?? new Dictionary<string, object>();
        }
    }
}