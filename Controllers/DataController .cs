using JOEX_DB_Engine.Models;
using JOEX_DB_Engine.Storage.LsmData;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace JOEX_DB_Engine.Controllers
{
    /// <summary>
    /// Not part of the requested engine-admin API, but included so the
    /// MemTable/WAL/SSTables aren't always empty — use these to write data,
    /// then hit /api/engine/flush and /api/engine/compact to see it move
    /// through the storage tiers.
    /// </summary>
    [Route("api/data")]
    [ApiController]
    public class DataController : ControllerBase
    {
        private readonly LsmEngine _engine;

        public DataController(LsmEngine engine)
        {
            _engine = engine;
        }

[HttpPut("{key}")]
    public IActionResult Put(string key, [FromBody] PutRequest request)
    {
        if (string.IsNullOrWhiteSpace(key))
            return BadRequest(new
            {
                message = "Key is required."
            });

        if (request == null)
            return BadRequest(new
            {
                message = "Request body is required."
            });

        var existing = _engine.Get(key);

        if (existing.Found)
            return Conflict(new
            {
                message = $"Key '{key}' already exists."
            });

        // Store the JSON as a string
        var json = request.Value.GetRawText();

        _engine.Put(key, json);

        return Ok(new
        {
            key,
            value = JsonDocument.Parse(json).RootElement,
            status = "written"
        });
    }
    [HttpGet("{key}")]
        public IActionResult Get(string key)
        {
            var result = _engine.Get(key);
            return result.Found ? Ok(result) : NotFound(result);
        }

        [HttpDelete("{key}")]
        public IActionResult Delete(string key)
        {
            _engine.Delete(key);
            return Ok(new { key, status = "deleted" });
        }
    }
}