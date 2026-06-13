using JOEX_DB_Engine.Interfaces;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/db")]
public class DatabaseController : ControllerBase
{
    private readonly IDatabase _database;

    public DatabaseController(IDatabase database)
    {
        _database = database;
    }

    [HttpPost("set")]
    public IActionResult Set(
        string key,
        string value)
    {
        _database.Set(key, value);
        _database.Save();

        return Ok();
    }

    [HttpGet("get/{key}")]
    public IActionResult Get(string key)
    {
        var value = _database.Get(key);

        if (value == null)
            return NotFound();

        return Ok(value);
    }

    [HttpDelete("{key}")]
    public IActionResult Delete(string key)
    {
        _database.Delete(key);
        _database.Save();

        return Ok();
    }
}