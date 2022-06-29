import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs';
import { filter, first, map } from 'rxjs/operators';

import { IKeyValuePair } from '../../interfaces/keyvaluepair.interface';

import {
    getFromLocalStorage,
    saveToLocalStorage,
} from '../../utilities/localStorageFunctions';

@Injectable()
export class ConfigurationService {
    config$: Observable<IKeyValuePair>;

    configSubject$: BehaviorSubject<IKeyValuePair> =
        new BehaviorSubject<IKeyValuePair>(undefined);

    constructor(private readonly http: HttpClient) {
        this.config$ = this.configSubject$.pipe(filter((config) => !!config));

        this.reload();
    }

    reload() {
        this.http
            .get<IKeyValuePair>('/config.json')
            .pipe(first())
            .subscribe((config) => {
                Object.keys(config).map((key) => {
                    const value = getFromLocalStorage(key);

                    if (value) {
                        config[key] = value;
                    }
                });

                this.configSubject$.next(config);
            });
    }

    getConfig(key: string): Observable<any> {
        return this.config$.pipe(map((config) => config[key]));
    }

    setConfig(key: string, value: string | number) {
        saveToLocalStorage(key, value);

        this.reload();
    }
}
