import { Component, Inject, OnDestroy, OnInit } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, filter, first, switchMap, tap } from 'rxjs/operators';

import { TRANSACTION_INTERVAL } from '../../constants/commons';

import { ITransactionData } from '../../interfaces/transactionData.interface';

import {
    getBlockExplorerLink,
    getBlockExplorerName,
} from '../../utilities/blockExplorer';
import { getAssetSymbol } from '../../utilities/asset';

import { EthereumService } from '../../services/ethereum/ethereum.service';
import { FoldingService } from '../../services/folding/folding.service';
import { MarketsService } from '../../services/markets/markets.service';

@Component({
    selector: 'app-transaction',
    templateUrl: './transaction.component.html',
})
export class TransactionComponent implements OnInit, OnDestroy {
    tx$: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);

    interval: number;
    error: string;
    step: string;
    transactionHash: string;

    getAssetSymbol = getAssetSymbol;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: ITransactionData,
        private ethereumService: EthereumService,
        public dialogRef: MatDialogRef<TransactionComponent>,
        public marketsService: MarketsService,
        public foldingService: FoldingService,
    ) {}

    ngOnInit() {
        (this.data.approveAccount &&
        this.data.approveAmount &&
        this.data.approveToken
            ? this.approveSpendingThenDoAction()
            : this.doAction()
        )
            .pipe(first())
            .subscribe(() => (this.step = 'done'));
    }

    ngOnDestroy() {
        this.clearInterval();
    }

    approveSpendingThenDoAction(): Observable<any> {
        this.step = 'approve';

        return this.marketsService
            .getAllowance(this.data.approveAccount, this.data.approveToken)
            .pipe(
                switchMap((allowance: number) => {
                    if (allowance < this.data.approveAmount) {
                        return this.foldingService
                            .approveAllowance(
                                this.data.approveAccount,
                                this.data.approveToken,
                                this.data.approveAmount,
                            )
                            .pipe(
                                switchMap((tx: any) =>
                                    tx.hash
                                        ? this.awaitTransaction(tx)
                                        : this.cancelWithError(tx),
                                ),
                                filter((tx) => !!tx),
                                first(),
                                switchMap(() => this.doAction()),
                            );
                    } else {
                        return this.doAction();
                    }
                }),
            );
    }

    awaitTransaction(tx: any): Observable<any> {
        this.transactionHash = tx.hash;

        this.tx$.next(undefined);

        this.interval = window.setInterval(async () => {
            const txReceipt = await this.ethereumService
                .getBaseProvider()
                .getTransactionReceipt(this.transactionHash);

            if (
                txReceipt?.confirmations >=
                this.ethereumService.getMinimumConfirmations()
            ) {
                this.tx$.next(txReceipt);

                if (txReceipt.status === 0) {
                    this.error = 'Transaction Failed!';
                }

                this.clearInterval();
            }
        }, TRANSACTION_INTERVAL);

        return this.tx$;
    }

    cancelWithError(tx: any): Observable<any> {
        this.error = tx.data?.message || tx.message;
        this.step = undefined;

        return of();
    }

    clearInterval() {
        if (this.interval) {
            window.clearInterval(this.interval);

            this.interval = undefined;
        }
    }

    doAction() {
        this.step = 'action';

        return this.data.action.pipe(
            catchError((e) => of(e)),
            switchMap((tx: any) =>
                tx.hash ? this.awaitTransaction(tx) : this.cancelWithError(tx),
            ),
            filter((tx) => !!tx),
            tap(() => this.data.callback && this.data.callback()),
        );
    }

    getBlockExplorerName(): string {
        return getBlockExplorerName(this.ethereumService.getNetwork());
    }

    getBlockExplorerLink(): string {
        return getBlockExplorerLink(
            this.transactionHash,
            this.ethereumService.getNetwork(),
        );
    }
}
