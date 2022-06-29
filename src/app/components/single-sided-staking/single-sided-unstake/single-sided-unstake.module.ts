import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';

import { FormatValuePipeModule } from '../../../pipes/format-value/format-value.pipe.module';

import { SingleSidedUnstakeComponent } from './single-sided-unstake.component';

@NgModule({
    declarations: [SingleSidedUnstakeComponent],
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        FormatValuePipeModule,
    ],
    exports: [SingleSidedUnstakeComponent],
})
export class SingleSidedUnstakeModule {}
