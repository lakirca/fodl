import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { ethers } from 'ethers';

import { BehaviorSubject, combineLatest, defer, from, Observable } from 'rxjs';
import { filter, first, map } from 'rxjs/operators';

import { DIALOG_MEDIUM } from '../../constants/commons';

import { convertToBigNumber, parseBigNumber } from '../../utilities/big-number';
import { formatValue } from '../../utilities/format-value';

import { EthereumService } from '../../services/ethereum/ethereum.service';
import { FoldingRewardsService } from '../../services/folding/foldingRewards/foldingRewards.service';

import { TransactionComponent } from '../../components/transaction/transaction.component';

@Component({
    selector: 'app-rewards',
    templateUrl: './rewards.component.html',
})
export class RewardsComponent {
    rewards$: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
    total$: Observable<number>;

    claimAmount: number;
    amountsReceived: number;
    totalTax: number;
    error: string;

    rewardsLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        false,
    );

    constructor(
        private dialog: MatDialog,
        private foldingRewardsService: FoldingRewardsService,
        public ethereumService: EthereumService,
    ) {
        combineLatest([
            this.ethereumService.connected$.pipe(
                filter((connected) => !!connected),
            ),
            this.ethereumService.account$.pipe(filter((account) => !!account)),
        ]).subscribe(() => this.getRewards());

        this.total$ = this.rewards$.pipe(
            filter((rewards) => !!rewards),
            map((rewards) =>
                parseBigNumber(
                    rewards.reduce(
                        (a, c) => a.add(c.remainingAmount),
                        ethers.BigNumber.from(0),
                    ),
                ),
            ),
        );
    }

    getRewards() {
        this.rewardsLoading$.next(true);

        this.foldingRewardsService
            .getRewards(this.ethereumService.getAccount())
            .subscribe(async (rewards) => {
                if (rewards.length) {
                    this.rewards$.next(
                        (
                            await Promise.all(
                                rewards.map(async (reward) => {
                                    const claimedAmount =
                                        await this.foldingRewardsService.getClaimedAmount(
                                            this.ethereumService.getAccount(),
                                            reward.merkleRoot,
                                        );

                                    const remainingAmount = claimedAmount
                                        ? ethers.BigNumber.from(
                                              reward.amount,
                                          ).sub(claimedAmount)
                                        : ethers.BigNumber.from(0);

                                    const schedule =
                                        await this.foldingRewardsService.getSchedule(
                                            reward.merkleRoot,
                                        );

                                    return {
                                        ...reward,
                                        startTime: schedule[0],
                                        taxingPeriod: schedule[1],
                                        remainingAmount,
                                    };
                                }),
                            )
                        )
                            .filter(
                                (reward) =>
                                    !reward.startTime.isZero() &&
                                    !reward.remainingAmount.isZero(),
                            )
                            .sort((a, b) =>
                                a.startTime.gt(b.startTime) ? 1 : -1,
                            ),
                    );
                }

                this.rewardsLoading$.next(false);
            });
    }

    setMax() {
        this.total$.pipe(first()).subscribe((total) => {
            this.claimAmount = parseFloat(formatValue(total, '', 2));

            this.simulateClaim();
        });
    }

    getClaims() {
        return this.rewards$
            .getValue()
            .reduce(
                (a, c) =>
                    a
                        .reduce(
                            (a_, c_) => a_.add(c_.remainingAmount),
                            ethers.BigNumber.from(0),
                        )
                        .lt(convertToBigNumber(this.claimAmount))
                        ? [...a, c]
                        : a,
                [],
            )
            .map((reward) => ({
                ...reward,
                merkleRoot: reward.merkleRoot,
                amountAvailable: ethers.BigNumber.from(reward.amount),
                merkleProof:
                    reward.merkleProof.length === 1 &&
                    reward.merkleProof[0] === ''
                        ? []
                        : reward.merkleProof,
            }));
    }

    async simulateClaim() {
        this.amountsReceived = undefined;
        this.totalTax = undefined;
        this.error = undefined;

        if (this.claimAmount) {
            const block = await this.ethereumService
                .getBaseProvider()
                .getBlock('latest');

            const totalTaxes = this.getClaims().map((claim) => ({
                ...claim,
                tax: claim.taxingPeriod
                    .add(claim.startTime)
                    .sub(block.timestamp)
                    .mul(convertToBigNumber(1))
                    .div(claim.taxingPeriod),
            }));

            let amountClaimed = ethers.BigNumber.from(0);
            let totalTax = ethers.BigNumber.from(0);

            let i = 0;

            for (
                i = 0;
                i < totalTaxes.length &&
                amountClaimed.lt(convertToBigNumber(this.claimAmount));
                i++
            ) {
                const { remainingAmount, tax } = totalTaxes[i];

                const amountNeeded = convertToBigNumber(this.claimAmount).sub(
                    amountClaimed,
                );

                if (remainingAmount.gt(amountNeeded)) {
                    amountClaimed = amountClaimed.add(amountNeeded);

                    totalTax = totalTax.add(
                        amountNeeded.mul(tax).div(convertToBigNumber(1)),
                    );
                } else {
                    amountClaimed = amountClaimed.add(remainingAmount);

                    totalTax = totalTax.add(
                        remainingAmount.mul(tax).div(convertToBigNumber(1)),
                    );
                }
            }

            this.totalTax = parseBigNumber(totalTax);
            this.amountsReceived = parseBigNumber(amountClaimed.sub(totalTax));

            return totalTaxes.splice(0, i);
        }
    }

    getTaxPercent(): number {
        return (this.totalTax / (this.totalTax + this.amountsReceived)) * 100;
    }

    async claim() {
        try {
            const claims = (await this.simulateClaim()).map((claim) => ({
                merkleRoot: claim.merkleRoot,
                amountAvailable: claim.amountAvailable,
                merkleProof: claim.merkleProof,
            }));

            await this.foldingRewardsService.claim(
                convertToBigNumber(this.claimAmount),
                claims,
                true,
            );

            this.dialog.open(TransactionComponent, {
                width: DIALOG_MEDIUM,
                data: {
                    title: 'Claim Rewards',
                    actionDescription: `Accept transaction to claim your ${formatValue(
                        this.amountsReceived,
                        ' ',
                    )} FODL rewards and pay ${formatValue(
                        this.totalTax,
                        ' ',
                    )} FODL tax.`,
                    action: defer(() =>
                        this.foldingRewardsService.claim(
                            convertToBigNumber(this.claimAmount),
                            claims,
                        ),
                    ),
                    callback: () => {
                        this.getRewards();

                        this.claimAmount = undefined;

                        this.simulateClaim();
                    },
                },
            });
        } catch {
            this.error = 'Cannot claim this amount.';
        }
    }
}
