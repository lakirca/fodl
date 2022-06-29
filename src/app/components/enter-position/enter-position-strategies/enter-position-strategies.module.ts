import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatSliderModule } from '@angular/material/slider';

import { FormatValuePipeModule } from '../../../pipes/format-value/format-value.pipe.module';
import { IconAssetModule } from '../../icon-asset/icon-asset.module';

import { MarketAssumptionService } from '../../../services/market-assumption/market-assumption.service';
import { EnterPositionStrategiesComponent } from './enter-position-strategies.component';

@NgModule({
    declarations: [EnterPositionStrategiesComponent],
    imports: [
        CommonModule,
        FormsModule,
        MatSliderModule,
        FormatValuePipeModule,
        IconAssetModule,
    ],
    providers: [MarketAssumptionService],
    exports: [EnterPositionStrategiesComponent],
})
export class EnterPositionStrategiesModule {}
