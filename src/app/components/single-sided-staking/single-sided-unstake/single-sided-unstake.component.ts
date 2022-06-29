import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { from } from 'rxjs';

import { ethers } from 'ethers';

import { DIALOG_MEDIUM } from '../../../constants/commons';

import {
    convertToBigNumber,
    parseBigNumber,
} from '../../../utilities/big-number';
import { formatValue } from '../../../utilities/format-value';

import { TransactionComponent } from '../../transaction/transaction.component';
import { SingleSidedStakingService } from '../../../services/single-sided-staking/single-sided-staking.service';

@Component({
    selector: 'app-single-sided-unstake',
    templateUrl: './single-sided-unstake.component.html',
})
export class SingleSidedUnstakeComponent {
    @Input() balance: ethers.BigNumber;
    @Input() xFodlPrice: number;

    @Output() reloadBalances: EventEmitter<any> = new EventEmitter();

    unstakeAmountBigNumber: ethers.BigNumber;
    unstakeAmount: number;

    constructor(
        private dialog: MatDialog,
        private singleSidedStakingService: SingleSidedStakingService,
    ) {}

    getFormattedBalance(): string {
        return this.balance
            ? formatValue(parseBigNumber(this.balance), ' ', 4)
            : '';
    }

    setMax() {
        this.unstakeAmountBigNumber = this.balance;

        this.unstakeAmount = parseFloat(
            formatValue(parseBigNumber(this.balance), 'xFODL'),
        );
    }

    modelChange() {
        if (this.unstakeAmount) {
            this.unstakeAmountBigNumber = convertToBigNumber(
                this.unstakeAmount,
            );
        }
    }

    unstake() {
        this.dialog.open(TransactionComponent, {
            width: DIALOG_MEDIUM,
            data: {
                title: 'Withdraw FODL Token',
                actionDescription: 'Please sign a transaction to withdraw FODL',
                action: from(
                    this.singleSidedStakingService.unstake(
                        this.unstakeAmountBigNumber,
                    ),
                ),
                callback: () => {
                    this.reloadBalances.emit();

                    this.modelChange();

                    this.unstakeAmount = 0;
                },
            },
        });
    }
}
