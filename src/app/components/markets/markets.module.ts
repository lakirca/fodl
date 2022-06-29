import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MatIconModule } from '@angular/material/icon';

import { AssetSymbolPipeModule } from '../../pipes/asset-symbol/asset-symbol.pipe.module';
import { FormatValuePipeModule } from '../../pipes/format-value/format-value.pipe.module';

import { IconAssetModule } from '../icon-asset/icon-asset.module';
import { IconPairModule } from '../icon-pair/icon-pair.module';
import { IconPlatformModule } from '../icon-platform/icon-platform.module';
import { EnterPositionModule } from '../enter-position/enter-position.module';

import { MarketsComponent } from './markets.component';
import { AprTooltipModule } from '../apr-tooltip/apr-tooltip.module';

@NgModule({
    declarations: [MarketsComponent],
    imports: [
        CommonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        AssetSymbolPipeModule,
        FormatValuePipeModule,
        AprTooltipModule,
        IconAssetModule,
        IconPairModule,
        IconPlatformModule,
        EnterPositionModule,
    ],
    exports: [MarketsComponent],
})
export class MarketsModule {}
