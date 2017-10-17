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
    public class MeController : Controller
    {
        private readonly DbConnection _connection;
        private readonly IConfigurationRoot _config;

        public MeController(DbConnection connection, IConfigurationRoot config)
        {
            this._connection = connection ?? throw new ArgumentNullException(nameof(connection));
            this._config = config ?? throw new ArgumentNullException(nameof(config));
        }

        [HttpGet("photos")]
        public async Task<IActionResult> MyPhotos(int size = 20, DateTimeOffset? before = null)
        {
            var email = this.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress")?.Value;
            if (String.IsNullOrEmpty(email)) return BadRequest(new { message = "No email in identity" });

            if (!before.HasValue) before = DateTimeOffset.UtcNow.AddMinutes(10);

            await _connection.OpenAsync();
            var userId = await _connection.ExecuteScalarAsync<string>("SELECT UserId FROM UsersMap WHERE email = @email", new { email });

            if (String.IsNullOrEmpty(userId)) return BadRequest(new { message = "User has no mappings" });

            var result = await _connection.QueryAsync($@"
                SELECT TOP {size} f.[Id]
                      ,f.[Time] AS [Date]
                      ,f.[Image] 
                      ,f.[CognitiveAnger] AS [Anger]
                      ,f.[CognitiveContempt] AS [Contempt]
                      ,f.[CognitiveDisgust] AS [Disgust]
                      ,f.[CognitiveFear] AS [Fear]
                      ,f.[CognitiveHappiness] AS [Happiness]
                      ,f.[CognitiveNeutral] AS [Neutral]
                      ,f.[CognitiveSadness] AS [Sadness]
                      ,f.[CognitiveSurprise] AS [Surprise]
                FROM [dbo].[Faces] AS f
                WHERE UserId = @userId AND CAST(f.[Time] AT TIME ZONE 'Israel Standard Time' AS DATE) <=  CAST(@before AT TIME ZONE 'Israel Standard Time' AS DATE)
                ORDER BY f.[Time] DESC",
                new
                {
                    userId,
                    before
                });

            return Ok(result
                .Select(f => new
                {
                    Url = $"{_config["ImagesEndpoint"]}/zoomin/{f.Id.ToString("D")}.jpg",
                    OriginalImage = $"{_config["ImagesEndpoint"]}/faces/{f.Image}",
                    f.Date,
                    Moods = new dynamic[] {
                        new { Name = "Anger", Score = f.Anger },
                        new { Name = "Contempt", Score = f.Contempt },
                        new { Name = "Disgust", Score = f.Disgust },
                        new { Name = "Fear", Score = f.Fear },
                        new { Name = "Happiness", Score = f.Happiness },
                        new { Name = "Neutral", Score = f.Neutral },
                        new { Name = "Sadness", Score = f.Sadness },
                        new { Name = "Surprise", Score = f.Surprise }
                    }
                }));
        }
    }
}
