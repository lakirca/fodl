import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormatValuePipeModule } from '../../pipes/format-value/format-value.pipe.module';

import { ErrorSnackBarComponent } from './error-snack-bar.component';

@NgModule({
    declarations: [ErrorSnackBarComponent],
    imports: [CommonModule, FormatValuePipeModule],
    exports: [ErrorSnackBarComponent],
})
export class ErrorSnackBarComponentModule {}
