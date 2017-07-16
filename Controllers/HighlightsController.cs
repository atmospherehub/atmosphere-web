using AtmosphereWeb.Models;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Data.Common;
using System.Linq;
using System.Threading.Tasks;

namespace AtmosphereWeb.Controllers
{
    [Route("api/[controller]")]
    [Authorize(ActiveAuthenticationSchemes = "Bearer")]
    public class HighlightsController : Controller
    {
        private readonly DbConnection _connection;

        public HighlightsController(DbConnection connection)
        {
            this._connection = connection ?? throw new ArgumentNullException(nameof(connection));
        }

        [HttpGet("[action]")]
        public async Task<IActionResult> Faces(FacesRequestModel model, int facesInGroup = 12, int amountOfGroups = 7)
        {
            if (!ModelState.IsValid) return BadRequest();

            DateTimeOffset getStartDate(DateParts value)
            {
                switch (value)
                {
                    case DateParts.DayOfYear: return DateTimeOffset.UtcNow.AddDays(-amountOfGroups);
                    case DateParts.Week: return DateTimeOffset.UtcNow.AddDays(-amountOfGroups * 7);
                    case DateParts.Month: return DateTimeOffset.UtcNow.AddMonths(-amountOfGroups);
                    default: throw new ArgumentOutOfRangeException();
                }
            }

            await _connection.OpenAsync();
            return Ok(await _connection.QueryAsync<FacesGroup>($@"
                SELECT 
	                MIN(f.[Time]) AS [StartDate],
	                (SELECT TOP {facesInGroup}
		                LOWER([Id]) AS [Url], 
                        [Image] AS [OriginalImage],
                        [Time] AT TIME ZONE 'Israel Standard Time' AS [Date],
		                [Cognitive{model.Mood.Value}] AS [Score]
	                 FROM [dbo].[Faces]
	                 WHERE [Time] >= MIN(f.[Time]) AND [Time] <= MAX(f.[Time])
	                 ORDER BY [Cognitive{model.Mood.Value}] DESC
	                 FOR XML PATH('Face'), ROOT('Faces')) AS [Faces]
                FROM [dbo].[Faces] AS f
                WHERE f.[Time] > @start
                GROUP BY DATEPART({model.GroupBy.Value.ToString().ToUpper()}, f.[Time] AT TIME ZONE 'Israel Standard Time')
                ORDER BY [StartDate] DESC",
                new
                {
                    start = getStartDate(model.GroupBy.Value)
                }));
        }
    }
}
