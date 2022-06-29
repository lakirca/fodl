import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';

import { FormatValuePipeModule } from '../../../pipes/format-value/format-value.pipe.module';

import { StakeComponent } from './stake.component';

@NgModule({
    declarations: [StakeComponent],
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        FormatValuePipeModule,
    ],
    exports: [StakeComponent],
})
export class StakeModule {}
