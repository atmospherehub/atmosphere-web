using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SpaServices.Webpack;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Data.Common;
using System.Data.SqlClient;
using System.Text;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.AspNetCore.Authentication;
using System.Threading.Tasks;
using System.Linq;

namespace AtmosphereWeb
{
    public class Startup
    {
        public Startup(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();
            Configuration = builder.Build();
        }

        public IConfigurationRoot Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddSingleton(provider => Configuration);
            services.AddScoped<DbConnection, SqlConnection>(
                provider => new SqlConnection(provider.GetRequiredService<IConfigurationRoot>().GetConnectionString("AtmosphereDatabase")));

            services.AddSingleton(new TokenValidationParameters
            {
                // define what to validate
                RequireExpirationTime = true,
                ValidateLifetime = true,
                ValidateIssuer = true,
                ValidateIssuerSigningKey = true,
                ValidateAudience = false,

                // define against what to validate
                ValidIssuer = "atmosphere-web",
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(Configuration["Authorization:SymmetricKey"])),

                // from which claims retrieve values
                NameClaimType = "name",
                RoleClaimType = "role",
            });

            // Add framework services.
            services.AddMvc();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory, IServiceProvider serviceProvider)
        {
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseWebpackDevMiddleware(new WebpackDevMiddlewareOptions
                {
                    HotModuleReplacement = true
                });
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            app.UseStaticFiles()
                .UseCookieAuthentication(new CookieAuthenticationOptions
                {
                    AuthenticationScheme = "Cookie",
                    AutomaticAuthenticate = true,
                    AutomaticChallenge = true,
                    LoginPath = new PathString("/account/login/"),
                    AccessDeniedPath = new PathString("/account/forbidden/"),
                    LogoutPath = new PathString("/account/logout/")
                })
                .UseJwtBearerAuthentication(new JwtBearerOptions
                {
                    AuthenticationScheme = "Bearer",
                    AutomaticAuthenticate = true,
                    AutomaticChallenge = true,
                    SaveToken = true,
                    TokenValidationParameters = serviceProvider.GetRequiredService<TokenValidationParameters>()
                })
                .UseGoogleAuthentication(new GoogleOptions
                {
                    AuthenticationScheme = "Google",
                    SignInScheme = "Cookie",
                    ClientId = Configuration["Authentication:Google:ClientId"],
                    ClientSecret = Configuration["Authentication:Google:ClientSecret"],
                    CallbackPath = "/account/signin-google",
                    Events = new GoogleAuthEvents(Configuration["Authentication:Google:LimitToDomain"])
                })
                .UseMvc(routes =>
                {
                    routes.MapRoute(
                        name: "default",
                        template: "{controller=Home}/{action=Index}/{id?}");

                    routes.MapSpaFallbackRoute(
                        name: "spa-fallback",
                        defaults: new { controller = "Home", action = "Index" });
                });
        }
    }

    internal class GoogleAuthEvents : OAuthEvents
    {
        private string _domainName;

        public GoogleAuthEvents(string domainName)
        {
            this._domainName = domainName;
        }

        public override Task RedirectToAuthorizationEndpoint(OAuthRedirectToAuthorizationContext context)
        {
            if (!String.IsNullOrEmpty(_domainName))
            {
                // this will enforce on Google's side to allow signin only 
                // with a given domain
                context = new OAuthRedirectToAuthorizationContext(
                    context.HttpContext,
                    context.Options,
                    context.Properties,
                    $"{context.RedirectUri}&hd={_domainName}");
            }
            return base.RedirectToAuthorizationEndpoint(context);
        }

        public override Task TicketReceived(TicketReceivedContext context)
        {
            if(!String.IsNullOrEmpty(_domainName))
            {
                var emailClaim = context.Ticket.Principal.Claims.FirstOrDefault(
                    c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress");

                if (emailClaim == null) 
                    context.Response.Redirect("/account/forbidden?reason=no_email_claim");

                if(emailClaim.Value == null || !emailClaim.Value.ToLower().EndsWith(_domainName))
                    context.Response.Redirect("/account/forbidden?reason=domain_not_allowed");
            }

            return base.TicketReceived(context);
        }
    }
}
