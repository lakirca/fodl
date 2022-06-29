import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ConfigurationService } from '../../services/configuration/configuration.service';
import { LeverageService } from '../../services/leverage/leverage.service';

import { FormatValuePipeModule } from '../../pipes/format-value/format-value.pipe.module';

import { AprTooltipModule } from '../../components/apr-tooltip/apr-tooltip.module';
import { IconPairModule } from '../../components/icon-pair/icon-pair.module';
import { IconPairPlatformModule } from '../../components/icon-pair-platform/icon-pair-platform.module';
import { IconPlatformModule } from '../../components/icon-platform/icon-platform.module';
import { NewPositionButtonModule } from '../../components/new-position-button/new-position-button.module';

import { TradingRoutesModule } from './trading-routing.module';

import { TradingComponent } from './trading.component';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [TradingComponent],
    imports: [
        CommonModule,
        HttpClientModule,
        FormsModule,
        MatProgressSpinnerModule,
        TradingRoutesModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatIconModule,
        MatProgressSpinnerModule,
        FormatValuePipeModule,
        AprTooltipModule,
        IconPairModule,
        IconPairPlatformModule,
        IconPlatformModule,
        NewPositionButtonModule,
    ],
    providers: [ConfigurationService, LeverageService],
})
export class TradingModule {}
