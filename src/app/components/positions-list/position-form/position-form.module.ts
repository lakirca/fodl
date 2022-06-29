import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';

import { AssetSymbolPipeModule } from '../../../pipes/asset-symbol/asset-symbol.pipe.module';
import { FormatValuePipeModule } from '../../../pipes/format-value/format-value.pipe.module';

import { AprTooltipModule } from '../../apr-tooltip/apr-tooltip.module';
import { IconAssetModule } from '../../icon-asset/icon-asset.module';
import { TransactionModule } from '../../transaction/transaction.module';

import { PositionFormComponent } from './position-form.component';
import { ClaimRewardsModule } from '../../claim-rewards/claim-rewards.module';
import { PositionCloseModule } from '../../position-close/position-close.module';

@NgModule({
    declarations: [PositionFormComponent],
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatSliderModule,
        AssetSymbolPipeModule,
        FormatValuePipeModule,
        AprTooltipModule,
        IconAssetModule,
        ClaimRewardsModule,
        PositionCloseModule,
        TransactionModule,
    ],
    exports: [PositionFormComponent],
})
export class PositionFormModule {}
