using Dapper;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Data.Common;
using System.Threading.Tasks;

namespace AtmosphereWeb.Controllers
{
    [Route("api/[controller]")]
    public class ChartsController : Controller
    {
        private readonly DbConnection _connection;

        public ChartsController(DbConnection connection)
        {
            this._connection = connection ?? throw new ArgumentNullException(nameof(connection));
        }

        [HttpGet("[action]")]
        public async Task<IActionResult> DayAveragesSeries([FromQuery]DateTimeOffset? from, [FromQuery]DateTimeOffset? to)
        {
            if (!from.HasValue || !to.HasValue) return BadRequest();

            await _connection.OpenAsync();
            return Ok(await _connection.QueryAsync<DayAverages>(@"
                SELECT 
                    DATEPART(DAY, [Time] AT TIME ZONE 'Israel Standard Time') AS [DayNumber]
                    ,MIN([Time]) AS [StartTime]
                    ,AVG([CognitiveAnger]) AS AvgAnger                    
                    ,AVG([CognitiveContempt]) AS AvgContempt                    
                    ,AVG([CognitiveDisgust]) AS AvgDisgust                    
                    ,AVG([CognitiveFear]) AS AvgFear                    
                    ,AVG([CognitiveHappiness]) AS AvgHappiness                    
                    ,AVG([CognitiveNeutral]) AS AvgNeutral                    
                    ,AVG([CognitiveSadness]) AS AvgSadness                    
                    ,AVG([CognitiveSurprise]) AS AvgSurprise
                FROM [dbo].[Faces]
                WHERE [Time] >= @start AND [Time] <= @end
                GROUP BY DATEPART(DAY, [Time] AT TIME ZONE 'Israel Standard Time') 
                ORDER BY [StartTime]",
                new
                {
                    start = from.Value.UtcDateTime,
                    end = to.Value.UtcDateTime
                }));
        }

        public class DayAverages
        {
            public int DayNumber { get; set; }
            public double AvgAnger { get; set; }
            public double AvgContempt { get; set; }
            public double AvgDisgust { get; set; }
            public double AvgFear { get; set; }
            public double AvgHappiness { get; set; }
            public double AvgNeutral { get; set; }
            public double AvgSadness { get; set; }
            public double AvgSurprise { get; set; }
        }
    }
}
