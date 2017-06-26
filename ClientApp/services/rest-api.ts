import { HttpClient as FetchClient } from 'aurelia-fetch-client';
import { HttpClient } from 'aurelia-http-client';
import { inject } from 'aurelia-framework';
import { getLogger, Logger } from 'aurelia-logging';

@inject(FetchClient, getLogger('RestApi'))
export class RestApi {
    private _fetchClient: FetchClient;
    private _httpClient: HttpClient;
    private _logger: Logger;

    constructor(fetchClient: FetchClient, logger: Logger) {
        this._fetchClient = fetchClient;
        this._logger = logger;

        this._fetchClient.configure(config => {
            config
                .useStandardConfiguration()
                .withBaseUrl('api/')
                .withDefaults({
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'Fetch'
                    }
                })
                .withInterceptor({
                    request: (request) => {
                        return this.getAccessToken(request);
                    },
                    responseError: (response) => {
                        this._logger.error('There was an error in response', response);
                        return response;
                    }
                });
        });

        this._httpClient = new HttpClient();
    }

    public get<T>(apiPath: string): Promise<T> {
        return this._fetchClient.fetch(apiPath)
            .then(result => {
                if (!result.ok) return null;
                return result.json() as Promise<T>;
            });
    }

    private getAccessToken(request: Request): Promise<Request> {
        return this._httpClient
            .get('/account/BearerToken')
            .then(data => {
                request.headers.append('Authorization', `Bearer ${data.response}`);
                return request;
            })
            .catch(error => {
                this._logger.error('Error refreshing token', error);
            });
    }
}