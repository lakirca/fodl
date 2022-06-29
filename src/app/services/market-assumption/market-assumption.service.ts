import { Injectable } from '@angular/core';

import { combineLatest, Observable } from 'rxjs';
import { filter, first, map } from 'rxjs/operators';

import { DEFAULT_MARKET_ASSUMPTION } from '../../constants/blockchain';

import { FoldingService } from '../folding/folding.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class MarketAssumptionService {
    marketAssumption: number;
    asNumber$: Observable<number>;
    asString$: Observable<string>;
    asLongString$: Observable<string>;

    constructor(
        private foldingService: FoldingService,
        private settingsService: SettingsService,
    ) {
        this.asNumber$ = this.settingsService.settings$.pipe(
            first(),
            filter((settings) => !!settings),
            map(() => {
                return (
                    parseFloat(
                        localStorage.getItem('longMarketChangeAssumption'),
                    ) || DEFAULT_MARKET_ASSUMPTION
                );
            }),
        );

        this.asNumber$.subscribe(
            (marketAssumption) => (this.marketAssumption = marketAssumption),
        );

        this.asString$ = combineLatest([
            this.foldingService.strategy$,
            this.asNumber$,
        ]).pipe(
            map(([strategy, assumption]) => {
                return `market ${
                    strategy === 'long' ? 'growth' : 'shrinking'
                } by ${Math.abs(assumption)}%`;
            }),
        );

        this.asLongString$ = this.asString$.pipe(
            map((string) => `(Assuming ${string})`),
        );
    }

    setValue(longMarketChangeAssumption: number) {
        this.settingsService.set(
            'longMarketChangeAssumption',
            longMarketChangeAssumption,
        );

        this.settingsService.save();
    }
}
