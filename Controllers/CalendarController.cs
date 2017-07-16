using AtmosphereWeb.Models;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Data.Common;
using System.Threading.Tasks;

namespace AtmosphereWeb.Controllers
{
    [Route("api/[controller]")]
    [Authorize(ActiveAuthenticationSchemes = "Bearer")]
    public class CalendarController : Controller
    {
        private readonly DbConnection _connection;

        public CalendarController(DbConnection connection)
        {
            this._connection = connection ?? throw new ArgumentNullException(nameof(connection));
        }

        [HttpGet("days")]
        public async Task<IActionResult> GetDays(DatesRangeModel datesModel)
        {
            if (!ModelState.IsValid) return BadRequest();
            if (datesModel.To.Value - datesModel.From.Value < TimeSpan.FromDays(1)) return BadRequest();

            await _connection.OpenAsync();

            return Ok(await _connection.QueryAsync($@"
                SELECT
	                MIN([Time]) AT TIME ZONE 'Israel Standard Time' AS [FirstPerson]
	                ,MAX([Time]) AT TIME ZONE 'Israel Standard Time' AS [LastPerson]
	                ,COUNT(*) AS [TotalPersons]
	                ,AVG([CognitiveHappiness]) AS [AvgHappiness]
	                ,AVG([CognitiveSadness]) AS [AvgSadness]
                FROM [Faces]
                WHERE [Time] >= @start AND [Time] <= @end
                GROUP BY DATEPART(DAYOFYEAR, [Time] AT TIME ZONE 'Israel Standard Time')",
                new
                {
                    start = datesModel.From.Value.UtcDateTime,
                    end = datesModel.To.Value.UtcDateTime
                }));
        }
    }
}
