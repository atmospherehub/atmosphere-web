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
                    CallbackPath = "/account/signin-google"
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
