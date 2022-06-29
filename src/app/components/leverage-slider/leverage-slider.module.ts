import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatSliderModule } from '@angular/material/slider';

import { TooltipModule } from '../tooltip/tooltip.module';

import { LeverageSliderComponent } from './leverage-slider.component';

@NgModule({
    declarations: [LeverageSliderComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatListModule,
        MatFormFieldModule,
        MatTableModule,
        MatIconModule,
        MatInputModule,
        MatSliderModule,
        MatSelectModule,
        MatTooltipModule,
        MatSelectModule,
        TooltipModule,
    ],
    exports: [LeverageSliderComponent],
})
export class LeverageSliderModule {}
