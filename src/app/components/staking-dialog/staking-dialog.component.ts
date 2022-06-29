import { Component, Inject } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ethers } from 'ethers';
import { BehaviorSubject } from 'rxjs';

import { LPService } from '../../services/lp/lp.service';
import { StakingService } from '../../services/staking/staking.service';

@Component({
    selector: 'app-staking-dialog',
    templateUrl: './staking-dialog.component.html',
})
export class StakingDialogComponent {
    geyserContract$: BehaviorSubject<ethers.Contract> =
        new BehaviorSubject<ethers.Contract>(undefined);

    lpContract$: BehaviorSubject<ethers.Contract> =
        new BehaviorSubject<ethers.Contract>(undefined);

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { pair: string },
        public dialogRef: MatDialogRef<StakingDialogComponent>,
        private lpService: LPService,
        private stakingService: StakingService,
    ) {
        this.lpService.connected$.subscribe(() => {
            switch (this.data.pair) {
                case 'FODL / USDC':
                    this.lpContract$.next(this.lpService.lpFodlUsdc);

                    break;
                case 'FODL / ETH':
                    this.lpContract$.next(this.lpService.lpFodlEth);

                    break;
            }
        });

        this.stakingService.connected$.subscribe(() => {
            switch (this.data.pair) {
                case 'FODL / USDC':
                    this.geyserContract$.next(this.stakingService.geyserUsdc);

                    break;
                case 'FODL / ETH':
                    this.geyserContract$.next(this.stakingService.geyserEth);

                    break;
            }
        });
    }
}
