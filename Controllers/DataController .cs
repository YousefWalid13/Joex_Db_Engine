using JOEX_DB_Engine.Models;
using JOEX_DB_Engine.Storage.LsmData;
using Microsoft.AspNetCore.Mvc;
using System.Text;
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
    public async Task<IActionResult> Put(string key)
    {
        if (string.IsNullOrWhiteSpace(key))
        {
            return BadRequest(new
            {
                message = "Key is required."
            });
        }

        if (Request.Body.CanSeek)
        {
            Request.Body.Position = 0;
        }

        using var reader = new StreamReader(Request.Body, Encoding.UTF8, detectEncodingFromByteOrderMarks: false, leaveOpen: true);
        var rawBody = await reader.ReadToEndAsync();

        if (Request.Body.CanSeek)
        {
            Request.Body.Position = 0;
        }

        var json = NormalizePayload(rawBody);
        var payload = JsonSerializer.Deserialize<JsonElement>(json);

        _engine.Put(key, json);

        return Ok(new
        {
            key,
            value = payload,
            status = "written"
        });
    }

    private static string NormalizePayload(string rawBody)
    {
        if (string.IsNullOrWhiteSpace(rawBody))
        {
            return "null";
        }

        try
        {
            using var document = JsonDocument.Parse(rawBody);
            if (document.RootElement.ValueKind == JsonValueKind.Object &&
                document.RootElement.TryGetProperty("value", out var valueProperty))
            {
                return valueProperty.GetRawText();
            }

            return document.RootElement.GetRawText();
        }
        catch (JsonException)
        {
            return JsonSerializer.Serialize(rawBody);
        }
    }

    [HttpGet("{key}")]
    public IActionResult Get(string key)
    {
        var result = _engine.Get(key);

        if (!result.Found)
            return NotFound(new
            {
                key,
                status = "not found"
            });

        try
        {
            var value = JsonSerializer.Deserialize<JsonElement>(result.Value!);

            return Ok(new
            {
                key = result.Key,
                value,
                found = true
            });
        }
        catch
        {
            return Ok(new
            {
                key = result.Key,
                value = result.Value,
                found = true
            });
        }
    }

    [HttpDelete("{key}")]
    public IActionResult Delete(string key)
    {
        var existing = _engine.Get(key);

        if (!existing.Found)
        {
            return NotFound(new
            {
                key,
                status = "not found"
            });
        }

        _engine.Delete(key);

        return Ok(new
        {
            key,
            status = "deleted"
        });
    }
    [HttpPost("upload")]
[Consumes("multipart/form-data")]
public async Task<IActionResult> UploadFile(IFormFile file)
{
    if (file == null || file.Length == 0)
    {
        return BadRequest(new
        {
            message = "No file uploaded."
        });
    }

    var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

    switch (extension)
    {
        case ".json":
            await ImportJson(file);
            break;

        case ".csv":
            await ImportCsv(file);
            break;

        case ".txt":
            await ImportText(file);
            break;

        case ".ndjson":
            await ImportNdJson(file);
            break;

        case ".log":
            await ImportLog(file);
            break;

        default:
            return BadRequest(new
            {
                message = $"Unsupported file type: {extension}"
            });
    }

    return Ok(new
    {
        file = file.FileName,
        size = file.Length,
        status = "Imported successfully"
    });
}

    private async Task ImportJson(IFormFile file)
    {
        using var reader = new StreamReader(file.OpenReadStream());

        var json = await reader.ReadToEndAsync();

        var document = JsonDocument.Parse(json);

        if (document.RootElement.ValueKind == JsonValueKind.Object)
        {
            foreach (var property in document.RootElement.EnumerateObject())
            {
                _engine.Put(property.Name, property.Value.GetRawText());
            }
        }
    }

    private async Task ImportCsv(IFormFile file)
    {
        using var reader = new StreamReader(file.OpenReadStream());

        var header = await reader.ReadLineAsync();

        if (header == null)
            return;

        var columns = header.Split(',');

        int index = 0;

        while (!reader.EndOfStream)
        {
            var line = await reader.ReadLineAsync();

            if (string.IsNullOrWhiteSpace(line))
                continue;

            var values = line.Split(',');

            var row = new Dictionary<string, string>();

            for (int i = 0; i < columns.Length && i < values.Length; i++)
                row[columns[i]] = values[i];

            _engine.Put($"row:{index++}", JsonSerializer.Serialize(row));
        }
    }

    private async Task ImportText(IFormFile file)
    {
        using var reader = new StreamReader(file.OpenReadStream());

        int lineNumber = 0;

        while (!reader.EndOfStream)
        {
            var line = await reader.ReadLineAsync();

            if (!string.IsNullOrWhiteSpace(line))
            {
                _engine.Put($"line:{lineNumber++}", line);
            }
        }
    }

    private async Task ImportNdJson(IFormFile file)
    {
        using var reader = new StreamReader(file.OpenReadStream());

        int index = 0;

        while (!reader.EndOfStream)
        {
            var line = await reader.ReadLineAsync();

            if (!string.IsNullOrWhiteSpace(line))
            {
                _engine.Put($"json:{index++}", line);
            }
        }
    }

    private async Task ImportLog(IFormFile file)
    {
        using var reader = new StreamReader(file.OpenReadStream());

        int index = 0;

        while (!reader.EndOfStream)
        {
            var line = await reader.ReadLineAsync();

            if (!string.IsNullOrWhiteSpace(line))
            {
                _engine.Put($"log:{index++}", line);
            }
        }
    }
}