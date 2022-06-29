import { Component } from '@angular/core';

import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';

import { IFoldingMarket } from '../../interfaces/market.interface';

import { isMarketSafe } from '../../utilities/marketSafe';

import { FoldingService } from '../../services/folding/folding.service';
import { MarketsService } from '../../services/markets/markets.service';

@Component({
    selector: 'app-markets',
    templateUrl: './markets.component.html',
    styleUrls: ['./markets.component.scss'],
})
export class MarketsComponent {
    foldingMarkets$: Observable<IFoldingMarket[]>;
    sortBy$: BehaviorSubject<string> = new BehaviorSubject<string>('total');
    selected$: BehaviorSubject<IFoldingMarket> =
        new BehaviorSubject<IFoldingMarket>(undefined);

    highlight: IFoldingMarket;

    constructor(
        public marketsService: MarketsService,
        public foldingService: FoldingService,
    ) {
        this.foldingMarkets$ = combineLatest([
            this.marketsService.foldingMarkets$.pipe(
                filter((foldingMarkets) => !!foldingMarkets),
            ),
            this.sortBy$.pipe(distinctUntilChanged()),
        ]).pipe(
            distinctUntilChanged(),
            map(([tvl, sortBy]) =>
                tvl
                    .sort((a, b) => {
                        const direction = sortBy.startsWith('-') ? -1 : 1;
                        const column = sortBy.replace('-', '');

                        switch (column) {
                            case 'platform':
                                return a.supplyMarket.platform.name >
                                    b.supplyMarket.platform.name
                                    ? direction
                                    : -direction;

                            case 'market':
                                return a.supplyMarket.assetSymbol +
                                    a.borrowAsset.asset.name >
                                    b.supplyMarket.assetSymbol +
                                        b.borrowAsset.asset.name
                                    ? direction
                                    : -direction;

                            case 'apr':
                                return a.apr +
                                    a.marketApr +
                                    a.marketDistributionApr <
                                    b.apr +
                                        b.marketApr +
                                        b.marketDistributionApr
                                    ? direction
                                    : -direction;

                            case 'nft':
                                return this.isEligibleNFT(a) <
                                    this.isEligibleNFT(b)
                                    ? direction
                                    : -direction;

                            default:
                                return a[column] < b[column]
                                    ? direction
                                    : -direction;
                        }
                    })
                    .filter((foldingMarket) =>
                        window.location.href.includes('nft-eligible=true')
                            ? this.isEligibleNFT(foldingMarket)
                            : true,
                    ),
            ),
        );

        this.foldingMarkets$
            .pipe(filter((foldingMarkets) => !!foldingMarkets?.length))
            .subscribe((tvlByMarket) => this.selected$.next(tvlByMarket[0]));

        this.selected$
            .pipe(filter((selected) => !!selected))
            .subscribe((selected) => console.log('selected market:', selected));
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

    isEligibleNFT(foldingMarket: IFoldingMarket): boolean {
        return !isMarketSafe(
            foldingMarket.supplyMarket.assetAddress,
            foldingMarket.borrowAsset.asset.address,
        );
    }
}
