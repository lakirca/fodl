import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
} from '@angular/core';

import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { LONGABLE } from '../../../constants/blockchain';

import { IMarketAsset } from '../../../interfaces/marketAsset.interface';

import { IMarket } from '../../../interfaces/market.interface';

import { convertMarketAsset } from '../../../utilities/convertMarketAsset';
import { isMarketSafe } from '../../../utilities/marketSafe';
import { isStableCoin } from '../../../utilities/stableCoin';

import { FoldingService } from '../../../services/folding/folding.service';
import { MarketAssumptionService } from '../../../services/market-assumption/market-assumption.service';
import { MarketsService } from '../../../services/markets/markets.service';

@Component({
    selector: 'app-enter-position-strategies',
    templateUrl: './enter-position-strategies.component.html',
    styleUrls: ['./enter-position-strategies.component.scss'],
})
export class EnterPositionStrategiesComponent implements OnChanges {
    @Input() market: IMarket;

    @Output() selectBorrowAsset: EventEmitter<IMarketAsset> =
        new EventEmitter<IMarketAsset>(undefined);
    @Output() selectLeverage: EventEmitter<number> = new EventEmitter<number>(
        undefined,
    );

    market$: BehaviorSubject<IMarket> = new BehaviorSubject<IMarket>(undefined);
    markets$: Observable<IMarket[]>;

    maxLeverage: number;

    constructor(
        public foldingService: FoldingService,
        public marketAssumptionService: MarketAssumptionService,
        private marketsService: MarketsService,
    ) {
        this.markets$ = combineLatest([
            this.foldingService.strategy$,
            this.marketsService.markets$,
            this.market$,
        ]).pipe(
            map(([strategy, markets, market]) => {
                let matchingMarkets: IMarket[] = [];

                if (strategy === 'long') {
                    matchingMarkets = markets.filter((market) =>
                        isStableCoin(market.assetAddress),
                    );
                } else if (strategy === 'short') {
                    matchingMarkets = markets.filter((market) =>
                        LONGABLE.map((longable) =>
                            longable.address.toLowerCase(),
                        ).includes(market.assetAddress.toLowerCase()),
                    );
                } else if (strategy === 'correlated') {
                    if (isStableCoin(market.assetAddress)) {
                        matchingMarkets = markets.filter((market) =>
                            isStableCoin(market.assetAddress),
                        );
                    }

                    if (
                        LONGABLE.map((longable) =>
                            longable.address.toLowerCase(),
                        ).includes(market.assetAddress.toLowerCase())
                    ) {
                        matchingMarkets = markets.filter((market) =>
                            LONGABLE.map((longable) =>
                                longable.address.toLowerCase(),
                            ).includes(market.assetAddress.toLowerCase()),
                        );
                    }

                    if (
                        !matchingMarkets
                            .map((market) => market.assetAddress.toLowerCase())
                            .includes(market.assetAddress.toLowerCase())
                    ) {
                        matchingMarkets = [...matchingMarkets, market];
                    }
                }

                return matchingMarkets
                    .filter(
                        (market) =>
                            market.platform.address.toLowerCase() ===
                            this.market.platform.address.toLowerCase(),
                    )
                    .sort((a, b) =>
                        this.getAprAgainst(a, 2) < this.getAprAgainst(b, 2)
                            ? 1
                            : -1,
                    );
            }),
        );
    }

    getAprAgainst(market: IMarket, leverage: number): number {
        const foldingMarket = this.marketsService.findFoldingMarket(
            this.market.platform.address,
            this.market.assetAddress,
            market.assetAddress,
        );

        return (
            (leverage * (this.market.supplyAPR + this.market.supplyRewardsAPR) -
                leverage * (market.borrowAPR - market.borrowRewardsAPR)) *
                100 +
            (foldingMarket && foldingMarket.totalValue
                ? this.marketsService.getFodlApr(
                      foldingMarket.totalValue,
                      leverage,
                      isMarketSafe(
                          foldingMarket.supplyMarket.assetAddress.toLowerCase(),
                          foldingMarket.borrowAsset.asset.address.toLowerCase(),
                      ),
                  )
                : 0)
        );
    }

    getAssumption(leverage: number): Observable<number> {
        return combineLatest([
            this.foldingService.strategy$,
            this.marketAssumptionService.asNumber$,
        ]).pipe(
            map(([strategy, marketAssumption]) =>
                strategy === 'long' || strategy === 'short'
                    ? leverage * marketAssumption
                    : 0,
            ),
        );
    }

    ngOnChanges(changes) {
        if (changes.market) {
            this.market$.next(this.market);

            this.maxLeverage = this.marketsService.getMaxLeverage(
                this.market.collateralFactor,
            );
        }
    }

    selectPreset(market: IMarket, leverage: number) {
        this.selectBorrowAsset.emit(convertMarketAsset(market));
        this.selectLeverage.emit(leverage);
    }
}
