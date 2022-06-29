import { Component, Input } from '@angular/core';

import { first, map } from 'rxjs/operators';

import { IPosition } from '../../interfaces/position.interface';

import { getAssetSymbol } from '../../utilities/asset';
import { parseBigNumber } from '../../utilities/big-number';
import { formatExchangeRate } from '../../utilities/format-exchange-rate';
import { liquidationPrice } from '../../utilities/liquidationPrice';

import { FoldingService } from '../../services/folding/folding.service';

const LIMIT_RATIO = 0.95;

@Component({
    selector: 'app-borrow-limit',
    templateUrl: './borrow-limit.component.html',
})
export class BorrowLimitComponent {
    @Input() position: IPosition;

    collateralUsageFactorLeftOffset: string;
    collateralUsageLimitLeftOffset: string;
    collateralUsageLimitHorizontalWidth: string;
    currentPrice: string;
    currentPriceExchange: string;
    liquidationPrice: string;
    liquidationExchange: string;
    stopLossPrice: string;
    stopLossExchange: string;

    constructor(private foldingService: FoldingService) {}

    ngOnInit() {
        if (this.position) {
            const supplyToken = getAssetSymbol(
                this.position.supplyTokenAddress,
            );
            const borrowToken = getAssetSymbol(
                this.position.borrowTokenAddress,
            );

            [this.currentPrice, this.currentPriceExchange] = formatExchangeRate(
                this.position.currentPrice,
                supplyToken,
                borrowToken,
            ).split(' ');

            this.foldingService
                .getStopLossConfiguration(this.position.positionAddress)
                .pipe(
                    first(),
                    map(([_, collateralUsageLimit]) =>
                        collateralUsageLimit
                            ? parseBigNumber(collateralUsageLimit) * 100
                            : 0,
                    ),
                )
                .subscribe((collateralUsageLimit) => {
                    if (collateralUsageLimit) {
                        const collateralUsageLimitLeftOffset = Math.floor(
                            100 - collateralUsageLimit * LIMIT_RATIO,
                        );

                        this.collateralUsageLimitLeftOffset = `${collateralUsageLimitLeftOffset}%`;

                        this.collateralUsageLimitHorizontalWidth = `${
                            100 - collateralUsageLimitLeftOffset
                        }%`;

                        [this.stopLossPrice, this.stopLossExchange] =
                            formatExchangeRate(
                                (this.position.supplyMarket.liquidationFactor *
                                    (collateralUsageLimit / 100) *
                                    this.position.supplyAmount) /
                                    this.position.borrowAmount,
                                supplyToken,
                                borrowToken,
                            ).split(' ');
                    }
                });

            this.collateralUsageFactorLeftOffset = `${Math.floor(
                100 - this.position.collateralUsageFactor * LIMIT_RATIO,
            )}%`;

            [this.liquidationPrice, this.liquidationExchange] =
                formatExchangeRate(
                    liquidationPrice(this.position),
                    borrowToken,
                    supplyToken,
                ).split(' ');
        }
    }
}
