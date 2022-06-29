import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';

import { FormatValuePipeModule } from '../../pipes/format-value/format-value.pipe.module';

import { DialogModule } from '../dialog/dialog.module';

import { SingleSidedStakeModule } from './single-sided-stake/single-sided-stake.module';
import { SingleSidedUnstakeModule } from './single-sided-unstake/single-sided-unstake.module';

import { SingleSidedStakingService } from '../../services/single-sided-staking/single-sided-staking.service';

import { SingleSidedStakingComponent } from './single-sided-staking.component';

@NgModule({
    declarations: [SingleSidedStakingComponent],
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatTabsModule,
        FormatValuePipeModule,
        DialogModule,
        SingleSidedStakeModule,
        SingleSidedUnstakeModule,
    ],
    providers: [SingleSidedStakingService],
    exports: [SingleSidedStakingComponent],
})
export class SingleSidedStakingModule {}
