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
        public async Task<IActionResult> MoodsAverages([FromQuery]DateTimeOffset? from, [FromQuery]DateTimeOffset? to, int minFacesInDay = 10)
        {
            if (!from.HasValue || !to.HasValue) return BadRequest();
            if (from.Value > to.Value) return BadRequest();

            var datePart = datePartFromRange(from.Value, to.Value);

            await _connection.OpenAsync();
            return Ok(await _connection.QueryAsync($@"
                SELECT 
                    DATEPART({@datePart}, [Time] AT TIME ZONE 'Israel Standard Time') AS [Group]
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
                GROUP BY DATEPART({@datePart}, [Time] AT TIME ZONE 'Israel Standard Time') 
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
                    DATEPART({@datePart}, [Time] AT TIME ZONE 'Israel Standard Time') AS [Group]
                    ,MIN([Time]) AS [StartTime]
					,COUNT(*) [Total]
                    ,SUM(CASE WHEN 
                            CognitiveAnger > CognitiveContempt AND 
                            CognitiveAnger > CognitiveDisgust AND 
                            CognitiveAnger > CognitiveFear AND
                            CognitiveAnger > CognitiveHappiness AND 
                            CognitiveAnger > CognitiveNeutral AND 
                            CognitiveAnger > CognitiveSadness AND 
                            CognitiveAnger > CognitiveSurprise THEN 1 ELSE 0 END) AS Anger
                    ,SUM(CASE WHEN 
                            CognitiveContempt > CognitiveAnger AND 
                            CognitiveContempt > CognitiveDisgust AND 
                            CognitiveContempt > CognitiveFear AND
                            CognitiveContempt > CognitiveHappiness AND 
                            CognitiveContempt > CognitiveNeutral AND 
                            CognitiveContempt > CognitiveSadness AND 
                            CognitiveContempt > CognitiveSurprise THEN 1 ELSE 0 END) AS Contempt
                    ,SUM(CASE WHEN 
                            CognitiveDisgust > CognitiveAnger AND 
                            CognitiveDisgust > CognitiveContempt AND 
                            CognitiveDisgust > CognitiveFear AND
                            CognitiveDisgust > CognitiveHappiness AND 
                            CognitiveDisgust > CognitiveNeutral AND 
                            CognitiveDisgust > CognitiveSadness AND 
                            CognitiveDisgust > CognitiveSurprise THEN 1 ELSE 0 END) AS Disgust
                    ,SUM(CASE WHEN 
                            CognitiveFear > CognitiveAnger AND 
                            CognitiveFear > CognitiveContempt AND 
                            CognitiveFear > CognitiveDisgust AND
                            CognitiveFear > CognitiveHappiness AND 
                            CognitiveFear > CognitiveNeutral AND 
                            CognitiveFear > CognitiveSadness AND 
                            CognitiveFear > CognitiveSurprise THEN 1 ELSE 0 END) AS Fear
                    ,SUM(CASE WHEN 
                            CognitiveHappiness > CognitiveAnger AND 
                            CognitiveHappiness > CognitiveContempt AND 
                            CognitiveHappiness > CognitiveDisgust AND
                            CognitiveHappiness > CognitiveFear AND 
                            CognitiveHappiness > CognitiveNeutral AND 
                            CognitiveHappiness > CognitiveSadness AND 
                            CognitiveHappiness > CognitiveSurprise THEN 1 ELSE 0 END) AS Happiness
                    ,SUM(CASE WHEN 
                            CognitiveNeutral > CognitiveAnger AND 
                            CognitiveNeutral > CognitiveContempt AND 
                            CognitiveNeutral > CognitiveDisgust AND
                            CognitiveNeutral > CognitiveFear AND 
                            CognitiveNeutral > CognitiveHappiness AND 
                            CognitiveNeutral > CognitiveSadness AND 
                            CognitiveNeutral > CognitiveSurprise THEN 1 ELSE 0 END) AS Neutral
                    ,SUM(CASE WHEN 
                            CognitiveSadness > CognitiveAnger AND 
                            CognitiveSadness > CognitiveContempt AND 
                            CognitiveSadness > CognitiveDisgust AND
                            CognitiveSadness > CognitiveFear AND 
                            CognitiveSadness > CognitiveHappiness AND 
                            CognitiveSadness > CognitiveNeutral AND 
                            CognitiveSadness > CognitiveSurprise THEN 1 ELSE 0 END) AS Sadness
                    ,SUM(CASE WHEN 
                            CognitiveSurprise > CognitiveAnger AND 
                            CognitiveSurprise > CognitiveContempt AND 
                            CognitiveSurprise > CognitiveDisgust AND
                            CognitiveSurprise > CognitiveFear AND 
                            CognitiveSurprise > CognitiveHappiness AND 
                            CognitiveSurprise > CognitiveNeutral AND 
                            CognitiveSurprise > CognitiveSadness THEN 1 ELSE 0 END) AS Surprise
                FROM [dbo].[Faces]
                WHERE [Time] >= @start AND [Time] <= @end
                GROUP BY DATEPART({@datePart}, [Time] AT TIME ZONE 'Israel Standard Time') 
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
                    ,(SUM(CognitiveAnger) 
					+ SUM(CognitiveContempt)
					+ SUM(CognitiveDisgust)
					+ SUM(CognitiveFear)
                    + SUM(CognitiveHappiness)
					+ SUM(CognitiveSadness)
					+ SUM(CognitiveSurprise)) / SUM(CognitiveNeutral) AS [PercentNonNeutral]
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

        private string datePartFromRange(DateTimeOffset from, DateTimeOffset to)
        {
            var range = to - from;
            if (range < TimeSpan.FromMinutes(120))
                return "MINUTE";
            else if (range < TimeSpan.FromHours(48))
                return "HOUR";
            else if (range < TimeSpan.FromDays(90))
                return "DAY";
            else
                return "MONTH";
        }
    }
}
