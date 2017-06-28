import { HttpClient as FetchClient } from 'aurelia-fetch-client';
import { inject } from 'aurelia-framework';
import { getLogger, Logger } from 'aurelia-logging';
import { AuthService } from "./auth";

@inject(FetchClient, AuthService, getLogger('RestApi')) 
export class RestApi {
    private _fetchClient: FetchClient;
    private _logger: Logger;
    private _authService: AuthService;

    constructor(fetchClient: FetchClient, authService: AuthService, logger: Logger) {
        this._fetchClient = fetchClient;
        this._authService = authService;
        this._logger = logger;

        this._fetchClient.configure(config => {
            config
                .useStandardConfiguration()
                .withBaseUrl('api/')
                .withDefaults({
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                })
                .withInterceptor({
                    request: (request) => {
                        return this._authService
                            .accessToken
                            .then((token: string) => {
                                request.headers.append('Authorization', `Bearer ${token}`);
                                return request;
                            });
                    },
                    responseError: (response) => {
                        this._logger.error('There was an error in response', response);
                        return response;
                    }
                });
        });
    }

    public get<T>(apiPath: string): Promise<T> {
        return this._fetchClient.fetch(apiPath)
            .then(result => {
                if (!result.ok) return null;
                return result.json() as Promise<T>;
            });
    }
}