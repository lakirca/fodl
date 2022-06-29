import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';

import { FormatValuePipeModule } from '../../pipes/format-value/format-value.pipe.module';

import { DialogModule } from '../dialog/dialog.module';

import { StakeModule } from './stake/stake.module';
import { UnstakeModule } from './unstake/unstake.module';

import { StakingDialogComponent } from './staking-dialog.component';

@NgModule({
    declarations: [StakingDialogComponent],
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatTabsModule,
        FormatValuePipeModule,
        DialogModule,
        StakeModule,
        UnstakeModule,
    ],
    exports: [StakingDialogComponent],
})
export class StakingDialogModule {}
