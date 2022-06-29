import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { MatIconModule } from '@angular/material/icon';

import { FormatValuePipeModule } from '../../../pipes/format-value/format-value.pipe.module';

import { LeaderboardComponent } from './leaderboard.component';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [LeaderboardComponent],
    imports: [
        CommonModule,
        HttpClientModule,
        FormsModule,
        MatIconModule,
        FormatValuePipeModule,
    ],
    exports: [LeaderboardComponent],
})
export class LeaderboardModule {}
