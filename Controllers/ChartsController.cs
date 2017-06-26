using Dapper;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Linq;
using System.Threading.Tasks;

namespace AtmosphereWeb.Controllers
{
    [Route("api/[controller]")]
    public class ChartsController : Controller
    {
        private readonly DbConnection _connection;
        private static readonly List<string> _groupParts = new List<string> {
            "DATEPART(YEAR, [Time] AT TIME ZONE 'Israel Standard Time')",
            "DATEPART(MONTH, [Time] AT TIME ZONE 'Israel Standard Time')",
            "DATEPART(DAY, [Time] AT TIME ZONE 'Israel Standard Time')",
            "DATEPART(HOUR, [Time] AT TIME ZONE 'Israel Standard Time')",
            "DATEPART(MINUTE, [Time] AT TIME ZONE 'Israel Standard Time')",
            "DATEPART(SECOND, [Time] AT TIME ZONE 'Israel Standard Time')"
        };
        private static readonly HashSet<string> _moodsColumns = new HashSet<string> {
            "CognitiveContempt",
            "CognitiveDisgust",
            "CognitiveFear",
            "CognitiveHappiness",
            "CognitiveNeutral",
            "CognitiveSadness",
            "CognitiveSurprise",
            "CognitiveAnger",
        };

        public ChartsController(DbConnection connection)
        {
            this._connection = connection ?? throw new ArgumentNullException(nameof(connection));
        }

        [HttpGet("[action]")]
        public async Task<IActionResult> MoodsAverages([FromQuery]DateTimeOffset? from, [FromQuery]DateTimeOffset? to, int minFacesInDay = 10)
        {
            if (!from.HasValue || !to.HasValue) return BadRequest();
            if (from.Value > to.Value) return BadRequest();

            var datePart = datePartFromRange(from.Value, to.Value);

            await _connection.OpenAsync();
            return Ok(await _connection.QueryAsync($@"
                SELECT 
                    {@datePart.selectPart} AS [Group]
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
                GROUP BY {@datePart.groupByPart} 
                HAVING COUNT(*) > @minFacesInDay
                ORDER BY [StartTime]",
                new
                {
                    start = from.Value.UtcDateTime,
                    end = to.Value.UtcDateTime,
                    minFacesInDay = minFacesInDay
                }));
        }

        [HttpGet("[action]")]
        public async Task<IActionResult> DominantMoodsCounts([FromQuery]DateTimeOffset? from, [FromQuery]DateTimeOffset? to, int minFacesInDay = 10)
        {
            if (!from.HasValue || !to.HasValue) return BadRequest();
            if (from.Value > to.Value) return BadRequest();

            var datePart = datePartFromRange(from.Value, to.Value);

            await _connection.OpenAsync();
            return Ok(await _connection.QueryAsync($@"
                SELECT 
                    {@datePart.selectPart} AS [Group]
                    ,MIN([Time]) AS [StartTime]
					,COUNT(*) [Total]
                    ,SUM(CASE WHEN {dominantCondition("CognitiveAnger")} THEN 1 ELSE 0 END) AS Anger
                    ,SUM(CASE WHEN {dominantCondition("CognitiveContempt")} THEN 1 ELSE 0 END) AS Contempt
                    ,SUM(CASE WHEN {dominantCondition("CognitiveDisgust")} THEN 1 ELSE 0 END) AS Disgust
                    ,SUM(CASE WHEN {dominantCondition("CognitiveFear")} THEN 1 ELSE 0 END) AS Fear
                    ,SUM(CASE WHEN {dominantCondition("CognitiveHappiness")} THEN 1 ELSE 0 END) AS Happiness
                    ,SUM(CASE WHEN {dominantCondition("CognitiveNeutral")} THEN 1 ELSE 0 END) AS Neutral
                    ,SUM(CASE WHEN {dominantCondition("CognitiveSadness")} THEN 1 ELSE 0 END) AS Sadness
                    ,SUM(CASE WHEN {dominantCondition("CognitiveSurprise")} THEN 1 ELSE 0 END) AS Surprise
                FROM [dbo].[Faces]
                WHERE [Time] >= @start AND [Time] <= @end
                GROUP BY {@datePart.groupByPart}
                HAVING COUNT(*) > @minFacesInDay
                ORDER BY [StartTime]",
                new
                {
                    start = from.Value.UtcDateTime,
                    end = to.Value.UtcDateTime,
                    minFacesInDay = minFacesInDay
                }));
        }

        [HttpGet("[action]")]
        public async Task<IActionResult> HourlyMoodsCounts([FromQuery]DateTimeOffset? from, [FromQuery]DateTimeOffset? to, double score = 0.1, int workDayStartHour = 7, int workDayEndHour = 20)
        {
            if (!from.HasValue || !to.HasValue) return BadRequest();

            await _connection.OpenAsync();
            return Ok(await _connection.QueryAsync(@"
                SELECT 
                    DATEPART(HOUR, [Time] AT TIME ZONE 'Israel Standard Time') AS [Hour]
					,COUNT(*) [Total]
                    ,SUM(CASE WHEN CognitiveAnger > @score THEN 1 ELSE 0 END) AS Anger
                    ,SUM(CASE WHEN CognitiveContempt > @score THEN 1 ELSE 0 END) AS Contempt
                    ,SUM(CASE WHEN CognitiveDisgust > @score THEN 1 ELSE 0 END) AS Disgust
                    ,SUM(CASE WHEN CognitiveFear > @score THEN 1 ELSE 0 END) AS Fear
                    ,SUM(CASE WHEN CognitiveHappiness > @score THEN 1 ELSE 0 END) AS Happiness
                    ,SUM(CASE WHEN CognitiveNeutral > @score THEN 1 ELSE 0 END) AS Neutral
                    ,SUM(CASE WHEN CognitiveSadness > @score THEN 1 ELSE 0 END) AS Sadness
                    ,SUM(CASE WHEN CognitiveSadness > @score THEN 1 ELSE 0 END) AS Sadness
                    ,SUM(CASE WHEN CognitiveSurprise > @score THEN 1 ELSE 0 END) AS Surprise
                FROM [dbo].[Faces]
                WHERE [Time] >= @start AND [Time] <= @end
					AND DATEPART(HOUR, [Time] AT TIME ZONE 'Israel Standard Time') > @workDayStartHour
					AND DATEPART(HOUR, [Time] AT TIME ZONE 'Israel Standard Time') < @workDayEndHour
                GROUP BY DATEPART(HOUR, [Time] AT TIME ZONE 'Israel Standard Time') 
                ORDER BY [Hour]",
                new
                {
                    start = from.Value.UtcDateTime,
                    end = to.Value.UtcDateTime,
                    score = score,
                    workDayStartHour = workDayStartHour,
                    workDayEndHour = workDayEndHour
                }));
        }

        [HttpGet("[action]")]
        public async Task<IActionResult> PeopleOnImageCounts([FromQuery]DateTimeOffset? from, [FromQuery]DateTimeOffset? to)
        {
            if (!from.HasValue || !to.HasValue) return BadRequest();

            await _connection.OpenAsync();
            return Ok(await _connection.QueryAsync(@"
                SELECT 
	                [PeopleOnImage], 
	                COUNT(*) AS [Count] 
                FROM (
	                SELECT 
		                COUNT(*) as [PeopleOnImage]
	                FROM [dbo].[Faces]
	                WHERE [Time] >= @start AND [Time] <= @end
	                GROUP BY [Image]) A 
                GROUP BY [PeopleOnImage]
                ORDER BY [PeopleOnImage]               
                ",
                new
                {
                    start = from.Value.UtcDateTime,
                    end = to.Value.UtcDateTime
                }));
        }

        [HttpGet("[action]")]
        public async Task<IActionResult> WeekDayNonNeutralPercent([FromQuery]DateTimeOffset? from, [FromQuery]DateTimeOffset? to, int minFacesInDay = 10)
        {
            if (!from.HasValue || !to.HasValue) return BadRequest();

            await _connection.OpenAsync();
            return Ok(await _connection.QueryAsync(@"
				SELECT 
                    DATEPART(WEEKDAY, [Time] AT TIME ZONE 'Israel Standard Time') AS [WeekDay]
					,COUNT(*) [Total]
                    , SUM(CognitiveAnger) AS SumAnger
					, SUM(CognitiveContempt) AS SumContempt
					, SUM(CognitiveDisgust) AS SumDisgust
					, SUM(CognitiveFear) AS SumFear
                    , SUM(CognitiveHappiness) AS SumHappiness
					, SUM(CognitiveSadness) AS SumSadness
					, SUM(CognitiveSurprise) AS SumSurprise
                    , SUM(CognitiveNeutral) AS SumNeutral
                FROM [dbo].[Faces]
                WHERE [Time] >= @start AND [Time] <= @end
                GROUP BY DATEPART(WEEKDAY, [Time] AT TIME ZONE 'Israel Standard Time') 
				HAVING COUNT(*) > @minFacesInDay
                ORDER BY [WeekDay]",
                new
                {
                    start = from.Value.UtcDateTime,
                    end = to.Value.UtcDateTime,
                    minFacesInDay = minFacesInDay
                }));
        }

        private (string selectPart, string groupByPart) datePartFromRange(DateTimeOffset from, DateTimeOffset to)
        {
            var range = to - from;
            if (range < TimeSpan.FromMinutes(120))
                return (_groupParts[4], String.Join(", ", _groupParts.Take(5)));
            else if (range < TimeSpan.FromDays(14))
                return (_groupParts[3], String.Join(", ", _groupParts.Take(4)));
            else if (range < TimeSpan.FromDays(200))
                return (_groupParts[2], String.Join(", ", _groupParts.Take(3)));
            else
                return (_groupParts[1], String.Join(", ", _groupParts.Take(2)));
        }

        private string dominantCondition(string mood) {

            return String.Join(" AND ", _moodsColumns
                .Where(m => m != mood)
                .Select(m => $"{mood} > {m}"));
        }
    }
}
