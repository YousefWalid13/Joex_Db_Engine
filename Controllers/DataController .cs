using JOEX_DB_Engine.Models;
using JOEX_DB_Engine.Storage.LsmData;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace JOEX_DB_Engine.Controllers;

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
        {
            return BadRequest(new
            {
                message = "Key is required."
            });
        }

        if (request == null)
        {
            return BadRequest(new
            {
                message = "Request body is required."
            });
        }

        var existing = _engine.Get(key);

        if (existing.Found)
        {
            return Conflict(new
            {
                message = $"Key '{key}' already exists."
            });
        }

        // Convert JsonElement to JSON string
        string json = JsonSerializer.Serialize(request.Value);

        _engine.Put(key, json);

        return Ok(new
        {
            key,
            value = request.Value,
            status = "written"
        });
    }

    [HttpGet("{key}")]
    public IActionResult Get(string key)
    {
        var result = _engine.Get(key);

        if (!result.Found)
            return NotFound(result);

        try
        {
            var parsed = JsonSerializer.Deserialize<JsonElement>(result.Value);

            return Ok(new
            {
                result.Key,
                Value = parsed,
                result.Found
            });
        }
        catch
        {
            return Ok(result);
        }
    }

    [HttpDelete("{key}")]
    public IActionResult Delete(string key)
    {
        _engine.Delete(key);

        return Ok(new
        {
            key,
            status = "deleted"
        });
    }
}