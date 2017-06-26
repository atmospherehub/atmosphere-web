using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Threading.Tasks;

namespace AtmosphereWeb.Controllers
{
    public class AccountController : Controller
    {
        private readonly TokenValidationParameters _tokenParameters;

        public AccountController(TokenValidationParameters tokenParameters)
        {
            this._tokenParameters = tokenParameters ?? throw new ArgumentNullException(nameof(tokenParameters));
        }

        public IActionResult Login(string returnUrl = null)
        {
            return new ChallengeResult(
                "Google",
                new AuthenticationProperties { RedirectUri = returnUrl });
        }
        public async Task<IActionResult> Logout(string returnUrl = null)
        {
            await HttpContext.Authentication.SignOutAsync("Cookie");
            return redirectLocal(returnUrl);
        }

        public IActionResult Forbidden()
        {
            return View();
        }

        [Authorize(ActiveAuthenticationSchemes = "Cookie")]
        public IActionResult BearerToken()
        {
            var identity = new ClaimsIdentity(User.Identity);
            var handler = new JwtSecurityTokenHandler();
            var token = handler.CreateToken(new SecurityTokenDescriptor()
            {
                Issuer = _tokenParameters.ValidIssuer,
                Audience = _tokenParameters.ValidAudience,
                SigningCredentials = new SigningCredentials(_tokenParameters.IssuerSigningKey, SecurityAlgorithms.HmacSha256Signature),
                Subject = identity,
                Expires = DateTime.UtcNow.AddMinutes(20)
            });
            handler.CreateJwtSecurityToken();

            return Ok(handler.WriteToken(token));
        }

        private IActionResult redirectLocal(string returnUrl)
        {
            if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl))
                return Redirect(returnUrl);
            else
                return Redirect("/");
        }
    }
}
