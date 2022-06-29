import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { DIALOG_MEDIUM } from '../../constants/commons';

import { convertToBigNumber, parseBigNumber } from '../../utilities/big-number';
import {
    isExchangeReverseRequired,
    reverseExchangeRate,
} from '../../utilities/format-exchange-rate';

import { FoldingService } from '../../services/folding/folding.service';

import { TransactionComponent } from '../transaction/transaction.component';
import { IPosition } from '../../interfaces/position.interface';

const DEFAULT_UNWIND_FACTOR = 100;
const DEFAULT_SLIPPAGE_INCENTIVE = 5;

@Component({
    selector: 'app-stop-loss-settings',
    templateUrl: './stop-loss-settings.component.html',
})
export class StopLossSettingsComponent implements OnInit {
    @Input() dialogRef?: MatDialogRef<any>;
    @Input() position: IPosition;

    unwindFactor: number;
    slippageIncentive: number;
    collateralUsageLimit: number;

    constructor(
        private dialog: MatDialog,
        public foldingService: FoldingService,
    ) {}

    ngOnInit() {
        this.getStopLossConfiguration();
    }

    getStopLossConfiguration() {
        this.foldingService
            .getStopLossConfiguration(this.position.positionAddress)
            .subscribe(
                ([slippageIncentive, collateralUsageLimit, unwindFactor]) => {
                    this.unwindFactor =
                        !unwindFactor || unwindFactor.isZero()
                            ? DEFAULT_UNWIND_FACTOR
                            : parseBigNumber(unwindFactor, 16);

                    this.slippageIncentive =
                        !slippageIncentive || slippageIncentive.isZero()
                            ? DEFAULT_SLIPPAGE_INCENTIVE
                            : parseBigNumber(slippageIncentive, 16);

                    this.collateralUsageLimit =
                        !collateralUsageLimit || collateralUsageLimit.isZero()
                            ? Math.round(
                                  (100 + this.getMinCollateralUsageLimit()) / 2,
                              )
                            : parseBigNumber(collateralUsageLimit, 16);
                },
            );
    }

    save() {
        if (this.dialogRef) {
            this.dialogRef.close();
        }

        this.dialog.open(TransactionComponent, {
            width: DIALOG_MEDIUM,
            id: 'stop-loss',
            data: {
                title: 'Save Stop Loss Configuration',
                actionDescription:
                    'Please sign a transaction to save stop loss bot configuration.',
                action: this.foldingService.configureStopLoss(
                    this.position.positionAddress,
                    convertToBigNumber(this.unwindFactor, 16),
                    convertToBigNumber(this.slippageIncentive, 16),
                    convertToBigNumber(this.collateralUsageLimit, 16),
                ),
            },
        });
    }

    getMinCollateralUsageLimit(): number {
        return Math.ceil(this.position.collateralUsageFactor);
    }

    getStopLossPriceBorrowToken(): number {
        return this.collateralUsageLimit
            ? this.position.borrowAmount /
                  (this.position.supplyMarket.liquidationFactor *
                      this.position.supplyAmount *
                      (this.collateralUsageLimit / 100))
            : 0;
    }

    getStopLossPriceReadableToken(): number {
        const price = this.getStopLossPriceBorrowToken();

        return isExchangeReverseRequired(
            price,
            this.position.borrowMarket.assetSymbol,
            this.position.supplyMarket.assetSymbol,
        )
            ? reverseExchangeRate(
                  price,
                  this.position.borrowMarket.assetSymbol,
                  this.position.supplyMarket.assetSymbol,
              )[0]
            : price;
    }

    getStopLossPriceReadableTokenAssetSymbol(): string {
        const price = this.getStopLossPriceBorrowToken();

        return isExchangeReverseRequired(
            price,
            this.position.borrowMarket.assetSymbol,
            this.position.supplyMarket.assetSymbol,
        )
            ? reverseExchangeRate(
                  price,
                  this.position.borrowMarket.assetSymbol,
                  this.position.supplyMarket.assetSymbol,
              )[1]
            : this.position.borrowMarket.assetSymbol;
    }

    setStopLossPriceBorrowToken(price = 0) {
        const minPrice =
            this.position.borrowAmount /
            (this.position.supplyMarket.liquidationFactor *
                this.position.supplyAmount);

        const maxPrice =
            this.position.borrowAmount /
            (this.position.supplyMarket.liquidationFactor *
                this.position.supplyAmount *
                (this.getMinCollateralUsageLimit() / 100));

        if (price < minPrice) {
            price = minPrice;
        }

        if (price > maxPrice) {
            price = maxPrice;
        }

        this.collateralUsageLimit =
            (this.position.borrowAmount /
                (this.position.supplyMarket.liquidationFactor *
                    this.position.supplyAmount *
                    price)) *
            100;
    }

    setStopLossPriceReadableToken(value) {
        const price = parseFloat(value.target.value) || 0;

        this.setStopLossPriceBorrowToken(
            isExchangeReverseRequired(
                price,
                this.position.borrowMarket.assetSymbol,
                this.position.supplyMarket.assetSymbol,
            )
                ? reverseExchangeRate(
                      price,
                      this.position.borrowMarket.assetSymbol,
                      this.position.supplyMarket.assetSymbol,
                  )[0]
                : price,
        );
    }

    getBorrowValueInSupplyTokenAtStopLoss(): number {
        return this.position.borrowAmount / this.getStopLossPriceBorrowToken();
    }

    getPrincipalAmountLeft(): number {
        return (
            this.position.supplyAmount -
            this.getBorrowValueInSupplyTokenAtStopLoss() *
                ((this.slippageIncentive / 100) * (this.unwindFactor / 100) + 1)
        );
    }

    getPositionValueLeft(): number {
        return this.getSupplyAmountLeft() - this.getBorrowAmountLeft() || 0;
    }

    getBorrowAmountLeft(): number {
        return (
            this.getBorrowValueInSupplyTokenAtStopLoss() *
            (1 - this.unwindFactor / 100)
        );
    }

    getBorrowAmountRepaid(): number {
        return (
            this.getBorrowValueInSupplyTokenAtStopLoss() *
            (this.unwindFactor / 100)
        );
    }

    getSupplyAmountLeft(): number {
        return this.position.supplyAmount - this.getSupplyAmountRedeemed();
    }

    getSupplyAmountRedeemed(): number {
        return (
            this.getBorrowAmountRepaid() * (1 + this.slippageIncentive / 100)
        );
    }

    getTipForTheBot(): number {
        return (
            this.getSupplyAmountRedeemed() - this.getBorrowAmountRepaid() || 0
        );
    }

    getLeverageAfterStopLoss(): number {
        return this.getSupplyAmountLeft() / this.getPositionValueLeft() || 0;
    }

    // GET MARKET APR
    getApr(): number {
        return (
            ((this.position.leverage + 1) *
                this.position.supplyMarket.supplyAPR -
                this.position.leverage * this.position.borrowMarket.borrowAPR) *
            100
        );
    }
}
