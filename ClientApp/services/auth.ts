
import { HttpClient } from 'aurelia-http-client';
import { inject } from 'aurelia-framework';
import { getLogger, Logger } from 'aurelia-logging';
import { PLATFORM, Platform } from 'aurelia-pal';
import { Deserialize, deserialize, deserializeAs } from 'cerialize';

@inject(PLATFORM, getLogger('AuthService'))
export class AuthService {
    private _httpClient: HttpClient;
    private _logger: Logger;
    private _platform: Platform;

    private _rawToken: string;
    private _promiseGettingToken: Promise<string>;
    public token: JwtToken;

    constructor(platform: Platform, logger: Logger) {
        this._logger = logger;
        this._platform = platform;
        this._logger.info('started');
        this._httpClient = new HttpClient();
        this._httpClient.configure(config => {
            config
                .withHeader('Accept', 'application/json')
                .withHeader('X-Requested-With', 'XMLHttpRequest');
        });
    }

    public get accessToken(): Promise<string> {
        if (this._rawToken != null && this.token.expiration > new Date())
            return Promise.resolve(this._rawToken);

        if (this._promiseGettingToken == null) {
            // to prevent situation where several API making request in the
            // same time, and we for each of those requests getting token
            this._logger.debug('Renewing access token', this.token);
            this._promiseGettingToken = this
                .getAccessToken()
                .then((rawToken: string) => {

                    try {
                        this.token = Deserialize(JSON.parse(atob(rawToken.split('.')[1])), JwtToken);
                        this._logger.debug('New JWT token was set', this.token);
                    } catch (e) {
                        throw new Error(`Invalid token returned: ${e.message}`);
                    }

                    this._rawToken = rawToken;
                    this._promiseGettingToken = null;
                    return this._rawToken;
                });
        }

        return this._promiseGettingToken;
    }

    public signOut(): void {
        this._platform.location.href = '/account/logout';
    }

    private getAccessToken(): Promise<string> {
        return this._httpClient
            .get('/account/bearertoken')
            .then(data => {
                this._logger.debug('Received new token', data);
                return data.response;
            })
            .catch(error => {
                this._logger.error('Error refreshing token', error);
                if (error.statusCode == 401 || error.statusCode == 403)
                    this.signOut();
            });
    }

}

export class JwtToken {
    @deserialize email: string;
    @deserializeAs('exp') expirationEpoch: number;
    @deserializeAs('unique_name') name: string;

    get expiration(): Date {
        var d = new Date(0);
        d.setUTCSeconds(this.expirationEpoch);
        return d;
    }
}