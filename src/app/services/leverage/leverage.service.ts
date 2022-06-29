import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ConfigurationService } from '../configuration/configuration.service';

@Injectable()
export class LeverageService {
    slippage$: Observable<number>;

    constructor(private configurationService: ConfigurationService) {
        this.slippage$ = this.configurationService.configSubject$.pipe(
            map((config) => parseFloat(config.exchangeSlippage)),
        );
    }

    increaseLeverageBySlippage(leverage: number): Observable<number> {
        return this.slippage$.pipe(
            map((slippage) => (leverage * (100 + slippage)) / 100),
        );
    }

    decreaseLeverageBySlippage(leverage: number): Observable<number> {
        return this.slippage$.pipe(
            map((slippage) => (leverage * (100 - slippage)) / 100),
        );
    }
}
