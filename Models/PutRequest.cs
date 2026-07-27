using System.Text.Json;

namespace JOEX_DB_Engine.Models
{
    public class PutRequest
    {
        public JsonElement? Value { get; set; }
    }
}