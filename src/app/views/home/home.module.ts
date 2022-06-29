import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ConfigurationService } from '../../services/configuration/configuration.service';
import { LeverageService } from '../../services/leverage/leverage.service';

import { PositionsListModule } from './../../components/positions-list/positions-list.module';
import { EnterPositionModule } from '../../components/enter-position/enter-position.module';
import { MarketsModule } from '../../components/markets/markets.module';

import { HomeRoutesModule } from './home-routing.module';

import { HomeComponent } from './home.component';

@NgModule({
    declarations: [HomeComponent],
    imports: [
        CommonModule,
        HttpClientModule,
        MatProgressSpinnerModule,
        HomeRoutesModule,
        EnterPositionModule,
        MarketsModule,
        PositionsListModule,
    ],
    providers: [ConfigurationService, EnterPositionModule, LeverageService],
})
export class HomeModule {}
