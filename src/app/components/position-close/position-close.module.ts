import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { FormatValuePipeModule } from '../../pipes/format-value/format-value.pipe.module';

import { TransactionModule } from '../transaction/transaction.module';

import { PositionCloseComponent } from './position-close.component';

@NgModule({
    declarations: [PositionCloseComponent],
    imports: [
        CommonModule,
        MatButtonModule,
        MatDialogModule,
        FormatValuePipeModule,
        TransactionModule,
    ],
    exports: [PositionCloseComponent],
})
export class PositionCloseModule {}
