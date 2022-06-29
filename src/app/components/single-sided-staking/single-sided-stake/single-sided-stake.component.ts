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

import { SingleSidedStakingService } from '../../../services/single-sided-staking/single-sided-staking.service';

import { TransactionComponent } from '../../transaction/transaction.component';

@Component({
    selector: 'app-single-sided-stake',
    templateUrl: './single-sided-stake.component.html',
})
export class SingleSidedStakeComponent {
    @Input() balance: ethers.BigNumber;
    @Input() xFodlPrice: number;

    @Output() reloadBalances: EventEmitter<any> = new EventEmitter();

    stakeAmountBigNumber: ethers.BigNumber;
    stakeAmount: number;

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
        this.stakeAmountBigNumber = this.balance;

        this.stakeAmount = parseFloat(
            formatValue(parseBigNumber(this.balance), 'FODL'),
        );
    }

    modelChange() {
        if (this.stakeAmount) {
            this.stakeAmountBigNumber = convertToBigNumber(this.stakeAmount);
        }
    }

    stake() {
        this.dialog.open(TransactionComponent, {
            width: DIALOG_MEDIUM,
            data: {
                title: 'Stake FODL Token',
                actionDescription: 'Please sign a transaction to stake FODL',
                action: from(
                    this.singleSidedStakingService.stake(
                        this.stakeAmountBigNumber,
                    ),
                ),
                callback: () => {
                    this.reloadBalances.emit();

                    this.modelChange();

                    this.stakeAmount = 0;
                },
            },
        });
    }
}
