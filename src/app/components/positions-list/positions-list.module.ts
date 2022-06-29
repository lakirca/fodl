import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { GaugeModule } from 'angular-gauge';

import { AssetSymbolPipeModule } from '../../pipes/asset-symbol/asset-symbol.pipe.module';
import { PlatformNamePipeModule } from '../../pipes/platform-name/platform-name.pipe.module';
import { FormatValuePipeModule } from '../../pipes/format-value/format-value.pipe.module';

import { AprTooltipModule } from '../apr-tooltip/apr-tooltip.module';
import { IconAssetModule } from '../icon-asset/icon-asset.module';
import { IconPairModule } from '../icon-pair/icon-pair.module';
import { IconPlatformModule } from '../icon-platform/icon-platform.module';
import { PaginatorModule } from '../paginator/paginator.module';

import { PositionFormModule } from './position-form/position-form.module';
import { PositionSettingsModule } from './position-settings/position-settings.module';

import { PositionsListComponent } from './positions-list.component';

@NgModule({
    declarations: [PositionsListComponent],
    imports: [
        CommonModule,
        MatButtonModule,
        MatCheckboxModule,
        MatIconModule,
        MatProgressSpinnerModule,
        GaugeModule,
        AssetSymbolPipeModule,
        FormatValuePipeModule,
        PlatformNamePipeModule,
        AprTooltipModule,
        IconAssetModule,
        IconPairModule,
        IconPlatformModule,
        PaginatorModule,
        PositionFormModule,
        PositionSettingsModule,
    ],
    exports: [PositionsListComponent],
})
export class PositionsListModule {}
