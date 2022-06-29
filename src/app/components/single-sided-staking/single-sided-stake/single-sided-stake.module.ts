import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';

import { FormatValuePipeModule } from '../../../pipes/format-value/format-value.pipe.module';

import { SingleSidedStakeComponent } from './single-sided-stake.component';

@NgModule({
    declarations: [SingleSidedStakeComponent],
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        FormatValuePipeModule,
    ],
    exports: [SingleSidedStakeComponent],
})
export class SingleSidedStakeModule {}
