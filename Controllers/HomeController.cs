using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace AtmosphereWeb.Controllers
{
    public class HomeController : Controller
    {
        [Authorize(ActiveAuthenticationSchemes = "Cookie")]
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Error()
        {
            return View();
        }
    }
}
