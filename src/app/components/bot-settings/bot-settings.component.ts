import { Component, Input, OnInit } from '@angular/core';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { filter, map } from 'rxjs/operators';

import { ethers } from 'ethers';

import { DIALOG_MEDIUM } from '../../constants/commons';

import { IPosition } from '../../interfaces/position.interface';

import { convertToBigNumber, parseBigNumber } from '../../utilities/big-number';

import { FoldingService } from '../../services/folding/folding.service';

import { TransactionComponent } from '../transaction/transaction.component';

const DEFAULT_UNWIND_FACTOR = 100;
const DEFAULT_PRICE_TARGET = 0;
const DEFAULT_FIXED_REWARD = 0;
const DEFAULT_PERCENTAGE_REWARD = 5;

@Component({
    selector: 'app-bot-settings',
    templateUrl: './bot-settings.component.html',
    styleUrls: ['./bot-settings.component.scss'],
})
export class BotSettingsComponent implements OnInit {
    @Input() dialogRef?: MatDialogRef<any>;
    @Input() position: IPosition;

    priceTarget = DEFAULT_PRICE_TARGET;
    fixedReward = DEFAULT_FIXED_REWARD;
    percentageReward = DEFAULT_PERCENTAGE_REWARD;
    unwindFactor = DEFAULT_UNWIND_FACTOR;
    isTakeProfit = false;

    amountRepayBorrow: number;
    supplyAmount: number;
    supplyValueLeft: number;

    valueAfterLiquidation: number;
    leverageAfterLiquidation: number;
    tip: number;

    slippageIncentive: number;
    collateralUsageLimit: number;

    constructor(
        private dialog: MatDialog,
        public foldingService: FoldingService,
    ) {}

    ngOnInit() {
        this.limitPriceTarget();
        this.getAllPNLSettings();
    }

    getAllPNLSettings() {
        this.foldingService
            .getAllPNLSettings(this.position.positionAddress)
            .pipe(
                filter((allSettings) => !!allSettings?.length),
                map((allSettings) => allSettings[0]),
            )
            .subscribe(
                ([
                    priceTarget,
                    fixedReward,
                    percentageReward,
                    unwindFactor,
                    isTakeProfit,
                ]) => {
                    this.unwindFactor = parseBigNumber(unwindFactor, 16);
                    this.priceTarget = parseBigNumber(priceTarget, 16);
                    this.fixedReward = parseBigNumber(fixedReward, 16);
                    this.percentageReward = parseBigNumber(
                        percentageReward,
                        16,
                    );

                    this.isTakeProfit = isTakeProfit;

                    this.calculateLimits();
                },
            );
    }

    save() {
        if (this.dialogRef) {
            this.dialogRef.close();
        }

        this.dialog.open(TransactionComponent, {
            width: DIALOG_MEDIUM,
            data: {
                title: 'Save PNL Bot Configuration',
                actionDescription:
                    'Please sign a transaction to save stop loss bot configuration.',
                action: this.foldingService.configurePNL(
                    this.position.positionAddress,
                    convertToBigNumber(this.priceTarget, 16),
                    convertToBigNumber(this.fixedReward, 16),
                    convertToBigNumber(this.percentageReward, 16),
                    convertToBigNumber(this.unwindFactor, 16),
                    this.isTakeProfit,
                ),
            },
        });
    }

    getApr(): number {
        return (
            (this.position.leverage * this.position.supplyMarket.supplyAPR -
                this.position.leverage * this.position.borrowMarket.borrowAPR) *
            100
        );
    }

    getPositionValueLeft(): number {
        return this.valueAfterLiquidation || 0;
    }

    getTipForTheBot(): number {
        return this.tip || 0;
    }

    getLeverageAfterStopLoss(): number {
        return this.leverageAfterLiquidation || 0;
    }

    convertToBorrowDecimals(input: ethers.BigNumber): ethers.BigNumber {
        return input
            .mul(
                convertToBigNumber(1, this.position.borrowMarket.assetDecimals),
            )
            .div(
                convertToBigNumber(1, this.position.supplyMarket.assetDecimals),
            );
    }

    calculateLimits() {
        const priceTargetBigNumber = this.convertToBorrowDecimals(
            convertToBigNumber(this.priceTarget),
        );

        const borrowAmount = parseBigNumber(
            this.position.borrowAmountBigNumber,
            this.position.borrowMarket.assetDecimals,
        );

        this.amountRepayBorrow = (borrowAmount * this.unwindFactor) / 100;

        const redeemAmount =
            (this.amountRepayBorrow * (1 + this.percentageReward / 100)) /
                this.priceTarget +
            this.fixedReward;

        this.supplyAmount = parseBigNumber(
            this.position.supplyAmountBigNumber,
            this.position.supplyMarket.assetDecimals,
        );

        this.supplyValueLeft = this.supplyAmount - redeemAmount;

        const currentPrice = this.position.supplyMarket.referencePrice.div(
            this.position.borrowMarket.referencePrice,
        );

        if (priceTargetBigNumber.lt(currentPrice.mul(convertToBigNumber(1)))) {
            this.isTakeProfit = false;
        } else {
            this.isTakeProfit = true;
        }

        const amountLeftBorrow = borrowAmount - this.amountRepayBorrow;

        const borrowValueLeft = amountLeftBorrow / this.priceTarget;

        this.valueAfterLiquidation = this.supplyValueLeft - borrowValueLeft;

        this.tip =
            this.amountRepayBorrow * (this.percentageReward / 100) +
            this.fixedReward;

        this.leverageAfterLiquidation =
            this.supplyValueLeft / (this.supplyValueLeft - borrowValueLeft);
    }

    limitPriceTarget() {
        this.calculateLimits();

        const priceLimit =
            (this.amountRepayBorrow * (1 + this.percentageReward / 100)) /
            (this.supplyAmount - this.fixedReward);

        if (this.priceTarget < priceLimit) {
            this.priceTarget = parseFloat(priceLimit.toFixed(8));
        }
    }

    limitFixedReward() {
        this.limitPriceTarget();

        if (this.fixedReward < 0) {
            this.fixedReward = 0;
        }
    }
}
