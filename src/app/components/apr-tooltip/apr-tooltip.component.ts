import { Component, Input } from '@angular/core';

import { isMarketSafe } from '../../utilities/marketSafe';

import { MarketsService } from '../../services/markets/markets.service';

import { IFoldingMarket } from '../../interfaces/market.interface';

@Component({
    selector: 'app-apr-tooltip',
    templateUrl: './apr-tooltip.component.html',
})
export class AprTooltipComponent {
    @Input() foldingMarket: IFoldingMarket;
    @Input() leverage?: number;

    constructor(private marketsService: MarketsService) {}

    getLeverage(): number {
        return this.leverage ? this.leverage : this.foldingMarket.maxLeverage;
    }

    getMarketApr(): number {
        return (
            (this.getLeverage() * this.foldingMarket.supplyMarket.supplyAPR -
                (this.getLeverage() - 1) *
                    this.marketsService.findMarket(
                        this.foldingMarket.supplyMarket.platform.address,
                        this.foldingMarket.borrowAsset.asset.address,
                    )?.borrowAPR) *
            100
        );
    }

    getMarketDistributionApr(): number {
        return (
            (this.getLeverage() *
                this.foldingMarket.supplyMarket.supplyRewardsAPR -
                (this.getLeverage() - 1) *
                    -this.marketsService.findMarket(
                        this.foldingMarket.supplyMarket.platform.address,
                        this.foldingMarket.borrowAsset.asset.address,
                    )?.borrowRewardsAPR) *
            100
        );
    }

    getFodlApr(): number {
        return this.marketsService.getFodlApr(
            this.foldingMarket.totalValue,
            this.getLeverage(),
            isMarketSafe(
                this.foldingMarket.supplyMarket.assetAddress.toLowerCase(),
                this.foldingMarket.borrowAsset.asset.address.toLowerCase(),
            ),
        );
    }
}
