import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';

import { FormatValuePipeModule } from '../../../pipes/format-value/format-value.pipe.module';

import { MarketAssumptionService } from '../../../services/market-assumption/market-assumption.service';

import { AprTooltipModule } from '../../apr-tooltip/apr-tooltip.module';
import { IconAssetModule } from '../../icon-asset/icon-asset.module';
import { AssetSelectModule } from '../../asset-select/asset-select.module';
import { TransactionModule } from '../../transaction/transaction.module';

import { EnterPositionFormComponent } from './enter-position-form.component';

@NgModule({
    declarations: [EnterPositionFormComponent],
    imports: [
        CommonModule,
        FormsModule,
        FormatValuePipeModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatSliderModule,
        AprTooltipModule,
        IconAssetModule,
        AssetSelectModule,
        TransactionModule,
    ],
    providers: [MarketAssumptionService],
    exports: [EnterPositionFormComponent],
})
export class EnterPositionFormModule {}
