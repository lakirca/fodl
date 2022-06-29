import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { FormatValuePipeModule } from '../../pipes/format-value/format-value.pipe.module';

import { TransactionModule } from '../transaction/transaction.module';

import { ClaimRewardsComponent } from './claim-rewards.component';

@NgModule({
    declarations: [ClaimRewardsComponent],
    imports: [
        CommonModule,
        MatButtonModule,
        MatDialogModule,
        FormatValuePipeModule,
        TransactionModule,
    ],
    exports: [ClaimRewardsComponent],
})
export class ClaimRewardsModule {}
