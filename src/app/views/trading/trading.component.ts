import { Component } from '@angular/core';

import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { isMarketSafe } from '../../utilities/marketSafe';
import { isStableCoin } from '../../utilities/stableCoin';

import { IFoldingMarket } from '../../interfaces/market.interface';

import { EthereumService } from '../../services/ethereum/ethereum.service';
import { MarketsService } from '../../services/markets/markets.service';

import { FoldingService } from '../../services/folding/folding.service';

@Component({
    selector: 'app-trading',
    templateUrl: './trading.component.html',
})
export class TradingComponent {
    platform = 'all';
    platform$: BehaviorSubject<string> = new BehaviorSubject<string>(
        this.platform,
    );
    sortBy$: BehaviorSubject<string> = new BehaviorSubject<string>('apr');
    foldingMarkets$: Observable<IFoldingMarket[]>;

    constructor(
        public ethereumService: EthereumService,
        public marketsService: MarketsService,
        public foldingService: FoldingService,
    ) {
        this.foldingMarkets$ = combineLatest([
            this.marketsService.foldingMarkets$.pipe(
                filter((foldingMarkets) => !!foldingMarkets),
            ),
            this.sortBy$,
            this.platform$,
        ]).pipe(
            map(([markets, sortBy, platform]) =>
                markets
                    .filter(
                        (market) =>
                            platform === 'all' ||
                            market.supplyMarket.platform.name.toLowerCase() ===
                                platform,
                    )
                    .sort((a, b) => {
                        const direction = sortBy.startsWith('-') ? -1 : 1;
                        const column = sortBy.replace('-', '');

                        switch (column) {
                            case 'market':
                                return a.supplyMarket.platform.name +
                                    a.supplyMarket.assetSymbol +
                                    a.borrowAsset.asset.name >
                                    b.supplyMarket.platform.name +
                                        b.supplyMarket.assetSymbol +
                                        b.borrowAsset.asset.name
                                    ? direction
                                    : -direction;

                            case 'apr':
                                return a.maxApr +
                                    a.marketMaxApr +
                                    a.marketMaxDistributionApr <
                                    b.maxApr +
                                        b.marketMaxApr +
                                        b.marketMaxDistributionApr
                                    ? direction
                                    : -direction;

                            default:
                                return a[column] < b[column]
                                    ? direction
                                    : -direction;
                        }
                    }),
            ),
        );
    }

    sortBy(column: string) {
        if (column === this.sortBy$.getValue().replace('-', '')) {
            this.sortBy$.next(
                `${
                    this.sortBy$.getValue().startsWith('-') ? '' : '-'
                }${column}`,
            );
        } else {
            this.sortBy$.next(column);
        }
    }

    getCallToAction(foldingMarket: IFoldingMarket): string {
        if (
            isMarketSafe(
                foldingMarket.supplyMarket.assetAddress,
                foldingMarket.borrowAsset.asset.address,
            )
        ) {
            return 'Farm';
        } else if (isStableCoin(foldingMarket.supplyMarket.assetAddress)) {
            return `Short ${foldingMarket.borrowAsset.asset.name}`;
        } else if (isStableCoin(foldingMarket.borrowAsset.asset.address)) {
            return `Long ${foldingMarket.supplyMarket.assetSymbol}`;
        } else {
            return 'Trade';
        }
    }

    isMarketSafe(foldingMarket: IFoldingMarket): boolean {
        return isMarketSafe(
            foldingMarket.supplyMarket.assetAddress,
            foldingMarket.borrowAsset.asset.address,
        );
    }

    openPosition(foldingMarket: IFoldingMarket) {
        console.log('opening position:', foldingMarket);
    }

    platformChanged() {
        this.platform$.next(this.platform);
    }
}
