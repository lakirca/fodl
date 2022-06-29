import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { MatTabsModule } from '@angular/material/tabs';

import { FormatValuePipeModule } from '../../pipes/format-value/format-value.pipe.module';

import { NftService } from '../../services/nft/nft.service';

import { NftRoutesModule } from './nft-routing.module';

import { AwardsModule } from './awards/awards.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { WinnersModule } from './winners/winners.module';

import { NftComponent } from './nft.component';

@NgModule({
    declarations: [NftComponent],
    imports: [
        CommonModule,
        HttpClientModule,
        NftRoutesModule,
        MatTabsModule,
        FormatValuePipeModule,
        AwardsModule,
        LeaderboardModule,
        WinnersModule,
    ],
    providers: [NftService],
})
export class NftModule {}
