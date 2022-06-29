import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HighchartsChartModule } from 'highcharts-angular';

import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { IconAssetModule } from '../icon-asset/icon-asset.module';

import { ExponentialToDecimalPipeModule } from './../../pipes/exponential-to-decimal/exponential-to-decimal.module';
import { PlatformNamePipeModule } from './../../pipes/platform-name/platform-name.pipe.module';
import { FormatValuePipeModule } from './../../pipes/format-value/format-value.pipe.module';
import { AssetSymbolPipeModule } from '../../pipes/asset-symbol/asset-symbol.pipe.module';
import { FormatExchangeRatePipeModule } from '../../pipes/format-exchange-rate/format-exchange-rate.pipe.module';

import { AssetGraphComponent } from './asset-graph.component';
import { AssetAddressPipeModule } from 'src/app/pipes/asset-address/asset-address.pipe.module';

@NgModule({
    declarations: [AssetGraphComponent],
    imports: [
        CommonModule,
        MatIconModule,
        HighchartsChartModule,
        AssetAddressPipeModule,
        FormatValuePipeModule,
        PlatformNamePipeModule,
        IconAssetModule,
        MatProgressSpinnerModule,
        ExponentialToDecimalPipeModule,
        AssetSymbolPipeModule,
        FormatExchangeRatePipeModule,
    ],
    exports: [AssetGraphComponent],
})
export class AssetGraphModule {}
