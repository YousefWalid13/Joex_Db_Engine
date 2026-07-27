using System.Text;
using System.Text.Json;
using JOEX_DB_Engine.Controllers;
using JOEX_DB_Engine.Storage.LsmData;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace JOEX_DB_Engine.Tests;

public class DataControllerTests
{
    [Fact]
    public async Task Put_ParsesJsonPayloadValue_WhenBodyContainsObject()
    {
        var engine = new LsmEngine();
        var controller = new DataController(engine);

        controller.ControllerContext = new Microsoft.AspNetCore.Mvc.ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                Request =
                {
                    Body = new MemoryStream(Encoding.UTF8.GetBytes("{\"value\":{\"name\":\"Ali\"}}"))
                }
            }
        };

        var result = await controller.Put("user:1");

        Assert.IsType<OkObjectResult>(result);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var payload = okResult.Value;
        Assert.NotNull(payload);

        var valueProperty = payload.GetType().GetProperty("value")?.GetValue(payload);
        Assert.NotNull(valueProperty);
        Assert.Equal(JsonValueKind.Object, JsonSerializer.SerializeToElement(valueProperty).ValueKind);
    }
}
