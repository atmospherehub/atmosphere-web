
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
