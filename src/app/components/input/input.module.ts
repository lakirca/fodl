import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from './input.component';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { FormatValuePipeModule } from '../../pipes/format-value/format-value.pipe.module';
import { MatInputFormattedDirective } from '../../../directives/mat-input-formatted.directive';

@NgModule({
    declarations: [InputComponent, MatInputFormattedDirective],
    imports: [
        CommonModule,
        MatIconModule,
        FormsModule,
        MatInputModule,
        FormatValuePipeModule,
    ],
    exports: [InputComponent],
})
export class InputModule {}
