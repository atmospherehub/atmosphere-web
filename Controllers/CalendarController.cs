using AtmosphereWeb.Models;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Data.Common;
using System.Linq;
using System.Threading.Tasks;

namespace AtmosphereWeb.Controllers
{
    [Route("api/[controller]")]
    [Authorize(ActiveAuthenticationSchemes = "Bearer")]
    public class CalendarController : Controller
    {
        private readonly DbConnection _connection;
        private readonly IConfigurationRoot _config;

        public CalendarController(DbConnection connection, IConfigurationRoot config)
        {
            this._connection = connection ?? throw new ArgumentNullException(nameof(connection));
            this._config = config ?? throw new ArgumentNullException(nameof(config));
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

        [HttpGet("day/{date}")]
        public async Task<IActionResult> GetDays(DateTimeOffset date)
        {
            if (!ModelState.IsValid) return BadRequest();

            await _connection.OpenAsync();
            var result = await _connection.QueryAsync($@"
                SELECT [Id]
                      ,[Time] AS [Date]
                      ,[Image] 
                      ,[CognitiveAnger] AS [Anger]
                      ,[CognitiveContempt] AS [Contempt]
                      ,[CognitiveDisgust] AS [Disgust]
                      ,[CognitiveFear] AS [Fear]
                      ,[CognitiveHappiness] AS [Happiness]
                      ,[CognitiveNeutral] AS [Neutral]
                      ,[CognitiveSadness] AS [Sadness]
                      ,[CognitiveSurprise] AS [Surprise]
                FROM [dbo].[Faces]
                WHERE CAST([Time] AT TIME ZONE 'Israel Standard Time' AS DATE) =  CAST(@date AT TIME ZONE 'Israel Standard Time' AS DATE)
                ORDER BY [Time]",
                new
                {
                    date
                });

            return Ok(result
                .Select(f => new
                {
                    Url = $"{_config["ImagesEndpoint"]}/zoomin/{f.Id.ToString("D")}.jpg",
                    OriginalImage = $"{_config["ImagesEndpoint"]}/faces/{f.Image}",
                    f.Date,
                    f.Anger,
                    f.Contempt,
                    f.Disgust,
                    f.Fear,
                    f.Happiness,
                    f.Neutral,
                    f.Sadness,
                    f.Surprise
                }));
        }
    }
}
