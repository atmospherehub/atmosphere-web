using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.Authentication;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace AtmosphereWeb.Controllers
{
    public class AccountController : Controller
    {
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
        public IActionResult GetBearerToken()
        {
            return new EmptyResult();
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
