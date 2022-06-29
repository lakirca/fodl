import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { EnterPositionFormModule } from './enter-position-form/enter-position-form.module';
import { EnterPositionStrategiesModule } from './enter-position-strategies/enter-position-strategies.module';

import { EnterPositionComponent } from './enter-position.component';

@NgModule({
    declarations: [EnterPositionComponent],
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        EnterPositionFormModule,
        EnterPositionStrategiesModule,
    ],
    exports: [EnterPositionComponent],
})
export class EnterPositionModule {}
