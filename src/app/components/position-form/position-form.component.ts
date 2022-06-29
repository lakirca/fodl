import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';

import { filter, first } from 'rxjs/operators';

import { IAsset } from '../../interfaces/asset.interface';
import { IMarket } from '../../interfaces/market.interface';
import { IPosition } from '../../interfaces/position.interface';
import { IPositionDetails } from '../../interfaces/positionDetails.interface';

import { DIALOG_MEDIUM } from '../../constants/commons';

import { convertMarketAsset } from '../../utilities/convertMarketAsset';
import { getRouteBase } from '../../utilities/getRouteBase';
import { formatValue } from '../../utilities/format-value';
import { liquidationPrice } from '../../utilities/liquidationPrice';

import { EthereumService } from '../../services/ethereum/ethereum.service';
import { FoldingService } from '../../services/folding/folding.service';
import { MarketsService } from '../../services/markets/markets.service';
import { SettingsService } from '../../services/settings/settings.service';

import { TransactionComponent } from '../transaction/transaction.component';
import { isExchangeReverseRequired } from 'src/app/utilities/format-exchange-rate';

@Component({
    selector: 'app-position-form',
    templateUrl: './position-form.component.html',
})
export class PositionFormComponent implements OnChanges {
    @Input() position: IPosition;
    @Input() edit: string;

    @Output() simulatedPositionDetails: EventEmitter<IPositionDetails> =
        new EventEmitter<IPositionDetails>();

    supplyAsset: IAsset;
    borrowAsset: IAsset;

    supplyAmount: number;
    supplyDelta: number;

    leverage: number;
    maxLeverage: number;

    slippage: number;

    markets: IMarket[];
    borrowMarkets: IMarket[];

    action = 'supply';

    liquidationPrice = 0;
    liquidationPriceDifference = 0;
    executionPrice = 0;
    executionPriceImpact = 0;

    constructor(
        private dialog: MatDialog,
        private router: Router,
        private ethereumService: EthereumService,
        private settingsService: SettingsService,
        public activatedRoute: ActivatedRoute,
        public foldingService: FoldingService,
        public marketsService: MarketsService,
    ) {
        this.settingsService.settings$
            .pipe(filter((settings) => !!settings))
            .subscribe((settings) => (this.slippage = settings.slippage));
    }

    ngOnChanges(changes: SimpleChanges) {
        this.marketsService.markets$
            .pipe(
                filter((markets) => !!markets),
                first(),
            )
            .subscribe((markets) => {
                this.markets = markets;

                this.borrowMarkets = markets.filter(
                    (market) =>
                        market.platform.address.toLowerCase() ===
                        this.ethereumService
                            .getNetworkSpecificDefaultPlatform()
                            .toLowerCase(),
                );

                if (
                    changes.position &&
                    changes.position.currentValue.supplyMarket &&
                    changes.position.currentValue.borrowMarket
                ) {
                    const position = changes.position.currentValue as IPosition;

                    if (position.supplyAmount && position.borrowAmount) {
                        const oraclePrice =
                            this.position.borrowMarket.assetUsdValue /
                            this.position.supplyMarket.assetUsdValue;

                        this.liquidationPrice =
                            (position.supplyAmount *
                                this.position.supplyMarket.liquidationFactor) /
                            position.borrowAmount;

                        if (
                            isExchangeReverseRequired(
                                this.liquidationPrice,
                                position.supplyMarket.assetSymbol,
                                position.borrowMarket.assetSymbol,
                            )
                        ) {
                            this.liquidationPriceDifference =
                                oraclePrice / this.liquidationPrice - 1;
                        } else {
                            this.liquidationPriceDifference =
                                this.liquidationPrice / oraclePrice - 1;
                        }
                    }

                    if (position.supplyMarket) {
                        this.supplyAsset = convertMarketAsset(
                            position.supplyMarket,
                        ).asset;
                    }

                    if (position.platformAddress) {
                        this.borrowMarkets = this.markets?.filter(
                            (market) =>
                                market.platform.address.toLowerCase() ===
                                position.platformAddress.toLowerCase(),
                        );
                    }

                    if (position.borrowMarket) {
                        if (
                            this.borrowMarkets.find(
                                (market) =>
                                    market.assetAddress.toLowerCase() ===
                                        position.borrowMarket.assetAddress.toLowerCase() &&
                                    market.platform.address.toLowerCase() ===
                                        position.borrowMarket.platform.address.toLowerCase(),
                            )
                        ) {
                            this.borrowAsset = convertMarketAsset(
                                position.borrowMarket,
                            ).asset;
                        } else {
                            this.borrowAsset = convertMarketAsset(
                                this.borrowMarkets[0],
                            ).asset;
                        }
                    }

                    if (position.leverage) {
                        this.leverage = parseFloat(
                            parseFloat(position.leverage.toString()).toFixed(2),
                        );
                    }

                    if (position.supplyMarket && position.borrowMarket) {
                        this.maxLeverage =
                            this.marketsService.findFoldingMarket(
                                this.supplyAsset.platformAddress,
                                this.supplyAsset.address,
                                this.borrowAsset.address,
                            )?.maxLeverage;
                    }

                    this.simulate();
                }
            });
    }

    navigateWithParams(params) {
        this.router.navigate([
            getRouteBase(this.router.url),
            {
                ...this.activatedRoute.snapshot.params,
                ...params,
            },
        ]);
    }

    onBothAssetsChange() {
        this.navigateWithParams({
            platform: this.supplyAsset.platformAddress,
            supplyAsset: this.supplyAsset.address,
            borrowAsset: this.borrowAsset.address,
        });
    }

    onSupplyAssetChange() {
        this.navigateWithParams({
            platform: this.supplyAsset.platformAddress,
            supplyAsset: this.supplyAsset.address,
        });
    }

    onBorrowAssetChange() {
        this.navigateWithParams({
            platform: this.supplyAsset.platformAddress,
            borrowAsset: this.borrowAsset.address,
        });
    }

    onLeverageChange() {
        this.simulate();
    }

    swapAssets() {
        const temp = this.borrowAsset;

        this.borrowAsset = this.supplyAsset;
        this.supplyAsset = temp;

        this.onBothAssetsChange();
    }

    getMax(): number {
        return this.markets.find(
            (market) =>
                market.assetAddress.toLowerCase() ===
                this.supplyAsset.address.toLowerCase(),
        )?.walletBalance;
    }

    setMax() {
        this.supplyAmount = parseFloat(
            formatValue(this.getMax(), this.supplyAsset.name),
        );

        this.simulate();
    }

    getMaxDelta(): number {
        return this.action === 'supply'
            ? this.getMax()
            : this.position.positionValue;
    }

    setMaxDelta() {
        this.supplyDelta = parseFloat(
            formatValue(this.getMaxDelta(), this.supplyAsset.name),
        );

        this.simulate();
    }

    modifySupplyAmount(amount: number) {
        if (!this.supplyAmount) {
            this.supplyAmount = 0;
        }

        this.supplyAmount += this.marketsService.getValueToken(
            amount,
            this.supplyAsset.address,
            this.supplyAsset.platformAddress,
        );

        if (this.supplyAmount < 0) {
            this.supplyAmount = 0;
        }

        this.supplyAmount = parseFloat(
            formatValue(this.supplyAmount, this.supplyAsset.name),
        );

        this.simulate();
    }

    modifySupplyDelta(amount: number) {
        if (!this.supplyDelta) {
            this.supplyDelta = 0;
        }

        this.supplyDelta += this.marketsService.getValueToken(
            amount,
            this.supplyAsset.address,
            this.supplyAsset.platformAddress,
        );

        if (this.supplyDelta < 0) {
            this.supplyDelta = 0;
        }

        const maxSupplyDelta = this.getMaxDelta();

        if (this.supplyDelta > maxSupplyDelta) {
            this.supplyDelta = maxSupplyDelta;
        }

        this.supplyDelta = parseFloat(
            formatValue(this.supplyDelta, this.supplyAsset.name),
        );

        this.simulate();
    }

    modifyLeverage(amount: number) {
        if (!this.leverage) {
            this.leverage = 1;
        }

        this.leverage += amount;

        if (this.leverage < 1) {
            this.leverage = 1;
        }

        if (this.leverage > this.maxLeverage) {
            this.leverage = this.maxLeverage;
        }

        this.leverage = parseFloat(formatValue(this.leverage, ' '));

        this.onLeverageChange();
    }

    getSupplyAmountUsd(): number {
        return this.marketsService.getValueUSD(
            this.supplyAmount,
            this.supplyAsset.address,
            this.supplyAsset.platformAddress,
        );
    }

    getSupplyDeltaUsd(): number {
        return this.marketsService.getValueUSD(
            this.supplyDelta,
            this.supplyAsset.address,
            this.supplyAsset.platformAddress,
        );
    }

    getSupplyMarket(): IMarket {
        return this.marketsService.findMarket(
            this.supplyAsset.platformAddress,
            this.supplyAsset.address,
        );
    }

    simulate() {
        if (
            (this.supplyAsset &&
                this.borrowAsset &&
                (this.supplyDelta || this.supplyAmount) &&
                this.leverage) ||
            this.edit === 'leverage'
        ) {
            this.foldingService
                .simulatePositionChange(
                    {
                        ...this.position,
                        platformAddress: this.supplyAsset.platformAddress,
                        supplyMarket: this.marketsService.findMarket(
                            this.supplyAsset.platformAddress,
                            this.supplyAsset.address,
                        ),
                        supplyTokenAddress: this.supplyAsset.address,
                        borrowMarket: this.marketsService.findMarket(
                            this.borrowAsset.platformAddress,
                            this.borrowAsset.address,
                        ),
                        borrowTokenAddress: this.borrowAsset.address,
                    },
                    this.supplyDelta
                        ? this.action === 'supply'
                            ? this.supplyDelta
                            : -this.supplyDelta
                        : this.supplyAmount,
                    this.leverage,
                )
                .pipe(first())
                .subscribe((positionDetails) => {
                    this.simulatedPositionDetails.emit(positionDetails);

                    const oraclePrice =
                        this.position.borrowMarket.assetUsdValue /
                        this.position.supplyMarket.assetUsdValue;

                    this.executionPrice = positionDetails.executionPrice;
                    this.executionPriceImpact =
                        this.executionPrice / oraclePrice - 1;

                    this.liquidationPrice =
                        (positionDetails.supplyAmount *
                            this.position.supplyMarket.liquidationFactor) /
                        positionDetails.borrowAmount;

                    if (
                        isExchangeReverseRequired(
                            this.liquidationPrice,
                            this.supplyAsset.name,
                            this.borrowAsset.name,
                        )
                    ) {
                        this.liquidationPriceDifference =
                            oraclePrice / this.liquidationPrice - 1;
                    } else {
                        this.liquidationPriceDifference =
                            this.liquidationPrice / oraclePrice - 1;
                    }
                });
        } else {
            this.simulatedPositionDetails.emit(
                this.foldingService.getPositionDetails(this.position),
            );

            this.liquidationPrice =
                liquidationPrice({
                    ...this.position,
                }) *
                (this.position.borrowMarket.assetUsdValue /
                    this.position.supplyMarket.assetUsdValue);
        }
    }

    validateSupplyAmount(): boolean {
        return this.supplyAmount > 0 && this.supplyAmount <= this.getMax();
    }

    validateSupplyDelta(): boolean {
        return this.supplyDelta > 0 && this.supplyDelta <= this.getMaxDelta();
    }

    validateLeverage(): boolean {
        return this.leverage >= 1 && this.leverage <= this.maxLeverage;
    }

    validateInputs(): boolean {
        return (
            (this.validateSupplyAmount() ||
                this.validateSupplyDelta() ||
                this.edit === 'leverage') &&
            this.validateLeverage()
        );
    }

    warnLiquidationPrice() {
        return Math.abs(this.liquidationPriceDifference) * 100 < 10;
    }

    getSubmitTitle(): string {
        return this.edit === 'all' ? 'Open Position' : `Change ${this.edit}`;
    }

    submit() {
        if (this.edit === 'all') {
            this.foldingService
                .createFoldingAccount(true)
                .subscribe((account: string) =>
                    this.dialog.open(TransactionComponent, {
                        width: DIALOG_MEDIUM,
                        data: {
                            title: 'Open Leverage Position',
                            actionDescription: `Please sign a transaction to send ${formatValue(
                                this.supplyAmount,
                            )} ${
                                this.supplyAsset.name
                            } to be used as a principal investment.`,
                            approveAccount: account,
                            approveToken: this.supplyAsset.address,
                            approveAmount: this.supplyAmount,
                            callback: () => {
                                this.supplyAmount = 0;

                                this.marketsService.getMarkets();

                                this.router.navigate(['/positions']);
                            },
                            action: this.foldingService.calculateAndIncreaseSimplePosition(
                                this.supplyAsset.platformAddress,
                                this.supplyAsset.address,
                                this.supplyAmount,
                                this.leverage,
                                this.borrowAsset.address,
                            ),
                        },
                    }),
                );
        }

        if (this.edit === 'value') {
            if (this.action === 'supply') {
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
                        approveAmount: this.supplyDelta,
                        approveToken: this.position.supplyTokenAddress,
                        action: this.foldingService.calculateAndIncreaseSimplePosition(
                            this.position.platformAddress,
                            this.position.supplyTokenAddress,
                            this.supplyDelta,
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
                            Math.abs(this.supplyDelta),
                        ),
                    },
                });
            }
        }

        if (this.edit === 'leverage') {
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
    }

    closePosition() {
        this.dialog.open(TransactionComponent, {
            width: DIALOG_MEDIUM,
            data: {
                title: 'Close Position',
                actionDescription: 'Accept transaction to close your position.',
                action: this.foldingService.calculateAndCloseSimplePosition(
                    this.position,
                ),
                callback: () => {
                    this.marketsService.getMarkets();
                    this.foldingService.getPositions();

                    this.router.navigate(['/positions']);
                },
            },
        });
    }
}
