
## Web client of atmosphere

[![Build status](https://ci.appveyor.com/api/projects/status/17g41da706wu6bn2/branch/master?svg=true)](https://ci.appveyor.com/project/jenyayel/atmosphere-web/branch/master)

This client app for presenting dashboards and aggregated data collected in atmosphere

## Required configurations

```
{
  "ConnectionStrings": {
    "AtmosphereDatabase": ""
  },
  "Authentication": {
    "Google": {
      "ClientID": "",
      "ClientSecret": ""
    }
  },
  "Authorization": {
    "SymmetricKey": ""
  },
  "ImagesEndpoint": ""
}
```

## Run

You can either just run debugger in Visual Studio (which will spin up Node.js with hot reload) or run from CLI:

```
dotnet restore
npm install
node .\node_modules\webpack\bin\webpack.js --config webpack.config.vendor.js
dotnet run
```

## Authorizations 

Few words:
* The authentication happens using Google
* Once user lands on application after Google, the auth* HttpOnly cookie is written - `Cookie` scheme
* `/` (root of SPA) and `/account/bearertoken` protected with scheme `Cookie`. This makes a cookie kinda refresh token.
* When API request made from SPA it first will obtain an access token in JWT format from `/account/bearertoken`
* All API controllers protected with `Bearer` scheme
