import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';

import { FormatValuePipeModule } from '../../../pipes/format-value/format-value.pipe.module';

import { UnstakeComponent } from './unstake.component';

@NgModule({
    declarations: [UnstakeComponent],
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        FormatValuePipeModule,
    ],
    exports: [UnstakeComponent],
})
export class UnstakeModule {}
