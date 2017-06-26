using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SpaServices.Webpack;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.Data.Common;
using System.Data.SqlClient;
using Microsoft.AspNetCore.Authentication;
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.Cookies;

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

            // Add framework services.
            services.AddMvc();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
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
                .UseCookieAuthentication(new CookieAuthenticationOptions()
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
                    SaveToken = true
                })
                .UseGoogleAuthentication(new GoogleOptions()
                {
                    AuthenticationScheme = "Google",
                    SignInScheme = "Cookie",
                    ClientId = Configuration["Authentication:Google:ClientId"],
                    ClientSecret = Configuration["Authentication:Google:ClientSecret"]
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
}
