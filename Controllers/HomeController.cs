using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;

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
