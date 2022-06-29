import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { IKeyValuePair } from '../../interfaces/keyvaluepair.interface';

import { ConfigurationService } from '../configuration/configuration.service';

@Injectable()
export class ApiService {
    backendUrl$: Observable<string>;
    bscBackendUrl$: Observable<string>;
    polygonBackendUrl$: Observable<string>;

    constructor(
        private readonly http: HttpClient,
        private configurationService: ConfigurationService,
    ) {
        this.backendUrl$ = this.configurationService.getConfig('backendUrl');
        this.bscBackendUrl$ =
            this.configurationService.getConfig('bscBackendUrl');
        this.polygonBackendUrl$ =
            this.configurationService.getConfig('polygonBackendUrl');
    }

    convertParamsToString(params: IKeyValuePair): string {
        return Object.keys(params)
            .map((key) => `${key}=${params[key]}`)
            .join('&');
    }

    get<T>(path: string, params?: IKeyValuePair): Observable<T> {
        const urlParams = params
            ? `?${this.convertParamsToString(params)}`
            : '';

        return this.backendUrl$.pipe(
            switchMap((backendUrl) =>
                this.http.get<T>(`${backendUrl}/${path}${urlParams}`),
            ),
        );
    }

    getBsc<T>(path: string, params?: IKeyValuePair): Observable<T> {
        const urlParams = params
            ? `?${this.convertParamsToString(params)}`
            : '';

        return this.bscBackendUrl$.pipe(
            switchMap((bscBackendUrl) =>
                this.http.get<T>(`${bscBackendUrl}/${path}${urlParams}`),
            ),
        );
    }

    getPolygon<T>(path: string, params?: IKeyValuePair): Observable<T> {
        const urlParams = params
            ? `?${this.convertParamsToString(params)}`
            : '';

        return this.polygonBackendUrl$.pipe(
            switchMap((polygonBackendUrl) =>
                this.http.get<T>(`${polygonBackendUrl}/${path}${urlParams}`),
            ),
        );
    }
}
