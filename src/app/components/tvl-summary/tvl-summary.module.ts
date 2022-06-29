import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { FormatValuePipeModule } from '../../pipes/format-value/format-value.pipe.module';

import { MarketsService } from '../../services/markets/markets.service';
import { LPService } from '../../services/lp/lp.service';
import { SingleSidedStakingService } from '../../services/single-sided-staking/single-sided-staking.service';
import { StakingService } from '../../services/staking/staking.service';
import { TvlService } from '../../services/tvl/tvl.service';

import { TvlSummaryComponent } from './tvl-summary.component';

@NgModule({
    declarations: [TvlSummaryComponent],
    imports: [CommonModule, MatProgressSpinnerModule, FormatValuePipeModule],
    providers: [
        MarketsService,
        LPService,
        SingleSidedStakingService,
        StakingService,
        TvlService,
    ],
    exports: [TvlSummaryComponent],
})
export class TvlSummaryModule {}
