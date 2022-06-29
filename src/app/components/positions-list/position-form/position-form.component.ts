import { Component, Input, OnInit } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';

import { Observable, Subscription } from 'rxjs';
import { filter, first, map, switchMap } from 'rxjs/operators';

import { DIALOG_MEDIUM } from '../../../constants/commons';

import { IPosition } from '../../../interfaces/position.interface';

import { parseBigNumber } from '../../../utilities/big-number';
import { formatValue } from '../../../utilities/format-value';
import { isMarketSafe } from '../../../utilities/marketSafe';

import { ConfigurationService } from '../../../services/configuration/configuration.service';
import { ERC20Service } from '../../../services/erc20/erc20.service';
import { EthereumService } from '../../../services/ethereum/ethereum.service';
import { FoldingService } from '../../../services/folding/folding.service';
import { MarketsService } from '../../../services/markets/markets.service';
import { LeverageService } from '../../../services/leverage/leverage.service';

import { TransactionComponent } from '../../transaction/transaction.component';

@Component({
    selector: 'app-position-form',
    templateUrl: './position-form.component.html',
})
export class PositionFormComponent implements OnInit {
    @Input() position: IPosition;

    stopLossCollateralUsageLimit: number;
    supplyAmount: number;
    borrowAmount: number;
    borrowLimit: number;
    delta: number;
    leverage: number;
    apr: number;

    leverage$: Observable<number>;

    simulateSubscription: Subscription;

    constructor(
        public marketsService: MarketsService,
        private foldingService: FoldingService,
        private configurationService: ConfigurationService,
        private leverageService: LeverageService,
        private erc20service: ERC20Service,
        private ethereumService: EthereumService,
        private dialog: MatDialog,
    ) {}

    ngOnInit() {
        this.leverage$ = this.leverageService
            .decreaseLeverageBySlippage(this.position.leverage)
            .pipe(
                first(),
                map((leverage) => (leverage > 1 ? leverage : 1)),
            );

        this.foldingService
            .getStopLossConfiguration(this.position.positionAddress)
            .pipe(
                first(),
                filter(
                    ([slippageIncentive, collateralUsageLimit, unwindFactor]) =>
                        !!collateralUsageLimit,
                ),
            )
            .subscribe(
                ([slippageIncentive, collateralUsageLimit, unwindFactor]) =>
                    (this.stopLossCollateralUsageLimit = parseBigNumber(
                        collateralUsageLimit,
                        16,
                    )),
            );

        this.resetValues();
    }

    changeLeverage() {
        this.dialog.open(TransactionComponent, {
            width: DIALOG_MEDIUM,
            data: {
                title: 'Change Leverage',
                actionDescription:
                    'Please confirm position leverage change transaction',
                callback: () => this.foldingService.getPositions(),
                action:
                    this.leverage > this.position.leverage
                        ? this.foldingService.calculateAndIncreaseSimplePositionLeverage(
                              this.position,
                              this.leverage,
                          )
                        : this.foldingService.calculateAndDecreaseSimplePositionLeverage(
                              this.position,
                              this.leverage,
                          ),
            },
        });
    }

    changePositionValue() {
        if (this.delta > 0) {
            this.dialog.open(TransactionComponent, {
                width: DIALOG_MEDIUM,
                data: {
                    title: 'Increase Position',
                    actionDescription:
                        'Please confirm transaction to increase your position.',
                    callback: () => {
                        this.marketsService.getMarkets();

                        this.foldingService.getPositions();
                    },
                    approveAccount: this.position.positionAddress,
                    approveAmount: this.delta,
                    approveToken: this.position.supplyTokenAddress,
                    action: this.foldingService.calculateAndIncreaseSimplePosition(
                        this.position.platformAddress,
                        this.position.supplyTokenAddress,
                        this.delta,
                        this.leverage,
                        this.position.borrowTokenAddress,
                        this.position.positionAddress,
                    ),
                },
            });
        } else {
            this.dialog.open(TransactionComponent, {
                width: DIALOG_MEDIUM,
                data: {
                    title: 'Decrease Position',
                    actionDescription:
                        'Please confirm transaction to decrease your position.',
                    callback: () => {
                        this.marketsService.getMarkets();

                        this.foldingService.getPositions();
                    },
                    action: this.foldingService.calculateAndDecreaseSimplePosition(
                        this.position,
                        Math.abs(this.delta),
                    ),
                },
            });
        }
    }

    disableChangeLeverage(): Observable<boolean> {
        return this.configurationService
            .getConfig('exchangeSlippage')
            .pipe(
                map(
                    (exchangeSlippage) =>
                        this.position.leverage >=
                            (this.leverage *
                                (100 - parseFloat(exchangeSlippage))) /
                                100 &&
                        this.position.leverage <=
                            (this.leverage *
                                (100 + parseFloat(exchangeSlippage))) /
                                100,
                ),
            );
    }

    disableChangePositionValue(): boolean {
        return this.delta === 0;
    }

    getMaxLeverage(): number {
        return this.marketsService.getMaxLeverage(
            this.marketsService.findMarket(
                this.position.platformAddress,
                this.position.supplyTokenAddress,
            ).collateralFactor,
        );
    }

    modifyDelta(amount: number) {
        this.setFormattedDelta(
            this.delta +
                this.marketsService.getValueToken(
                    amount,
                    this.position.supplyMarket.assetAddress,
                    this.position.supplyMarket.platform.address,
                ),
        );

        this.simulate();
    }

    simulate() {
        this.setFormattedDelta(this.delta);

        const maxPositionValue =
            this.position.positionValue +
            this.position.supplyMarket.walletBalance;

        if (this.position.positionValue + this.delta > maxPositionValue) {
            this.setFormattedDelta(maxPositionValue);
        }

        this.supplyAmount = parseFloat(
            formatValue(
                (this.position.positionValue + this.delta) * this.leverage,
                this.position.supplyMarket.assetSymbol,
            ),
        );

        if (this.simulateSubscription) {
            this.simulateSubscription.unsubscribe();
        }

        if (this.delta || this.leverage != this.position.leverage) {
            this.simulateSubscription = this.foldingService
                .getBorrowAmountForPosition(
                    this.position.platformAddress,
                    this.position.supplyTokenAddress,
                    this.position.positionValue + this.delta,
                    this.leverage,
                    this.position.borrowTokenAddress,
                )
                .pipe(first())
                .subscribe(([borrowAmount]) => {
                    this.borrowAmount =
                        parseFloat(
                            formatValue(
                                borrowAmount,
                                this.position.borrowMarket.assetSymbol,
                            ),
                        ) || 0;

                    const borrowUsd = this.marketsService.getValueUSD(
                        borrowAmount,
                        this.position.borrowTokenAddress,
                        this.position.platformAddress,
                    );

                    const supplyUsd = this.marketsService.getValueUSD(
                        this.supplyAmount,
                        this.position.supplyTokenAddress,
                        this.position.platformAddress,
                    );

                    this.borrowLimit =
                        (borrowUsd /
                            (supplyUsd *
                                this.position.supplyMarket.liquidationFactor)) *
                            100 || 0;
                });
        }

        const totalBorrowAPR =
            this.position.borrowMarket.borrowAPR -
            this.position.borrowMarket.borrowRewardsAPR;

        const totalSupplyAPR =
            this.leverage *
            (this.position.supplyMarket.supplyAPR +
                this.position.supplyMarket.supplyRewardsAPR);

        const foldingMarket = this.marketsService.findFoldingMarket(
            this.position.platformAddress,
            this.position.supplyTokenAddress,
            this.position.borrowTokenAddress,
        );

        this.apr =
            (totalSupplyAPR - this.leverage * totalBorrowAPR) * 100 +
            (foldingMarket && foldingMarket.totalValue
                ? this.marketsService.getFodlApr(
                      foldingMarket.totalValue,
                      this.leverage,
                      isMarketSafe(
                          foldingMarket.supplyMarket.assetAddress.toLowerCase(),
                          foldingMarket.borrowAsset.asset.address.toLowerCase(),
                      ),
                  )
                : 0);
    }

    async setFormattedDelta(delta: number) {
        this.delta =
            Math.abs(delta) < 0.00001
                ? 0
                : parseFloat(
                      formatValue(
                          delta,
                          this.position.supplyMarket.assetSymbol,
                      ),
                  );

        const maxDelta = parseBigNumber(
            await this.erc20service.getBalance(
                this.ethereumService.getAccount(),
                this.position.supplyMarket.assetAddress,
            ),
            this.position.supplyMarket.assetDecimals,
        );

        if (this.delta > maxDelta) {
            this.delta = maxDelta;
        }
    }

    resetValues() {
        this.supplyAmount = this.position.supplyAmount;
        this.borrowAmount = this.position.borrowAmount;
        this.borrowLimit = this.position.collateralUsageFactor;
        this.leverage = this.position.leverage;
        this.apr = this.position.apr;

        this.setFormattedDelta(0);
    }
}
