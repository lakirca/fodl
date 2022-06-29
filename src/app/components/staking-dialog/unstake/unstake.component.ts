import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { from } from 'rxjs';

import { ethers } from 'ethers';

import { DIALOG_MEDIUM } from '../../../constants/commons';

import {
    convertToBigNumber,
    parseBigNumber,
} from '../../../utilities/big-number';
import { formatValue } from '../../../utilities/format-value';

import { EthereumService } from '../../../services/ethereum/ethereum.service';
import { StakingService } from '../../../services/staking/staking.service';

import { TransactionComponent } from '../../transaction/transaction.component';

@Component({
    selector: 'app-unstake',
    templateUrl: './unstake.component.html',
})
export class UnstakeComponent implements OnInit {
    @Input() dialogRef: MatDialogRef<any>;

    @Input() geyserContract: ethers.Contract;
    @Input() lpContract: ethers.Contract;

    unstakeAmount: number;

    rewards = 0;
    balance = 0;

    constructor(
        private dialog: MatDialog,
        private stakingService: StakingService,
        public ethereumService: EthereumService,
    ) {}

    ngOnInit() {
        this.stakingService.connected$.subscribe(async () => {
            const balanceBigNumber = await this.stakingService.balanceOf(
                this.geyserContract,
            );

            this.balance = parseBigNumber(balanceBigNumber);

            this.rewards = parseBigNumber(
                await this.stakingService.earned(this.geyserContract),
            );
        });
    }

    setMax() {
        this.unstakeAmount = parseFloat(formatValue(this.balance, 'SLP'));
    }

    limitMaxAmount() {
        if (this.unstakeAmount > this.balance) {
            this.unstakeAmount = this.balance;
        }
    }

    unstake() {
        this.dialogRef.close();

        this.dialog.open(TransactionComponent, {
            width: DIALOG_MEDIUM,
            data: {
                title: 'Withdraw SLP Token',
                actionDescription: 'Please sign a transaction to withdraw LP',
                callback: () => this.stakingService.updated$.next(true),
                action: from(
                    this.stakingService.withdraw(
                        this.geyserContract,
                        convertToBigNumber(this.unstakeAmount),
                    ),
                ),
            },
        });
    }

    exit() {
        this.dialogRef.close();

        this.dialog.open(TransactionComponent, {
            width: DIALOG_MEDIUM,
            data: {
                title: 'Exit',
                actionDescription:
                    'Please sign a transaction to exit LP position',
                callback: () => this.stakingService.updated$.next(true),
                action: from(this.stakingService.exit(this.geyserContract)),
            },
        });
    }

    claim() {
        this.dialogRef.close();

        this.dialog.open(TransactionComponent, {
            width: DIALOG_MEDIUM,
            data: {
                title: 'Claim FODL rewards',
                actionDescription:
                    'Please sign a transaction to claim FODL rewards',
                callback: () => this.stakingService.updated$.next(true),
                action: from(
                    this.stakingService.getReward(this.geyserContract),
                ),
            },
        });
    }
}
