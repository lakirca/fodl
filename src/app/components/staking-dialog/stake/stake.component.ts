import { Component, Input, OnInit } from '@angular/core';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { from, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { ethers } from 'ethers';

import { DIALOG_MEDIUM } from '../../../constants/commons';

import {
    convertToBigNumber,
    parseBigNumber,
} from '../../../utilities/big-number';
import { formatValue } from '../../../utilities/format-value';

import { EthereumService } from '../../../services/ethereum/ethereum.service';
import { LPService } from '../../../services/lp/lp.service';
import { StakingService } from '../../../services/staking/staking.service';

import { TransactionComponent } from '../../transaction/transaction.component';

@Component({
    selector: 'app-stake',
    templateUrl: './stake.component.html',
})
export class StakeComponent implements OnInit {
    @Input() dialogRef: MatDialogRef<any>;

    @Input() geyserContract: ethers.Contract;
    @Input() lpContract: ethers.Contract;

    stakeAmount: number;
    balance = 0;

    constructor(
        private dialog: MatDialog,
        private lpService: LPService,
        private stakingService: StakingService,
        private ethereumService: EthereumService,
    ) {}

    ngOnInit() {
        this.lpService.connected$.subscribe(
            async () =>
                (this.balance = parseBigNumber(
                    await this.lpService.balanceOf(
                        this.lpContract,
                        this.ethereumService.getAccount(),
                    ),
                )),
        );
    }

    setMax() {
        this.stakeAmount = parseFloat(formatValue(this.balance, 'SLP'));
    }

    limitMaxAmount() {
        if (this.stakeAmount > this.balance) {
            this.stakeAmount = this.balance;
        }
    }

    stake() {
        this.dialogRef.close();

        this.dialog.open(TransactionComponent, {
            width: DIALOG_MEDIUM,
            data: {
                title: 'Stake SLP Token',
                actionDescription: 'Please sign a transaction to stake LP',
                approveAccount: this.geyserContract.address,
                approveToken: this.lpContract.address,
                approveAmount: this.stakeAmount,
                callback: () => this.stakingService.updated$.next(true),
                action: of([]).pipe(
                    switchMap(() =>
                        from(
                            this.stakingService.stake(
                                this.geyserContract,
                                convertToBigNumber(this.stakeAmount),
                            ),
                        ),
                    ),
                ),
            },
        });
    }
}
