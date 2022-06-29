import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { first } from 'rxjs/operators';

import { DIALOG_MEDIUM } from '../../constants/commons';
import { MIN_REWARDS } from '../../constants/blockchain';

import { IPosition } from '../../interfaces/position.interface';

import { formatValue } from '../../utilities/format-value';

import { FoldingService } from '../../services/folding/folding.service';
import { MarketsService } from '../../services/markets/markets.service';

import { TransactionComponent } from '../transaction/transaction.component';

@Component({
    selector: 'app-claim-rewards',
    templateUrl: './claim-rewards.component.html',
})
export class ClaimRewardsComponent implements OnInit {
    @Input() position: IPosition;

    rewards: number;
    rewardsAssetSymbol: string;

    minRewards = MIN_REWARDS;

    constructor(
        public foldingService: FoldingService,
        private marketsService: MarketsService,
        private dialog: MatDialog,
    ) {}

    ngOnInit() {
        this.foldingService
            .getRewardsAmount(this.position.positionAddress)
            .pipe(first())
            .subscribe((rewards) => (this.rewards = rewards));

        this.foldingService
            .getRewardsSymbol(this.position.positionAddress)
            .pipe(first())
            .subscribe(
                (assetSymbol) => (this.rewardsAssetSymbol = assetSymbol),
            );
    }

    claimRewards() {
        if (this.rewards && this.rewards > 0) {
            this.dialog.open(TransactionComponent, {
                width: DIALOG_MEDIUM,
                data: {
                    title: 'Claim Rewards',
                    actionDescription: `Accept transaction to claim your rewards of ${formatValue(
                        this.rewards,
                        this.rewardsAssetSymbol,
                    )} ${this.rewardsAssetSymbol}.`,
                    action: this.foldingService.claimRewards(
                        this.position.positionAddress,
                    ),
                    callback: () => {
                        this.marketsService.getMarkets();

                        this.foldingService.getPositions();
                    },
                },
            });
        }
    }
}
