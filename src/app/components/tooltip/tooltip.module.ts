import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';

import { TooltipComponent } from './tooltip.component';

@NgModule({
    declarations: [TooltipComponent],
    imports: [CommonModule, MatIconModule],
    exports: [TooltipComponent],
})
export class TooltipModule {}
