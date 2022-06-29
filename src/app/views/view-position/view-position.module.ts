import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PositionModule } from '../../components/position/position.module';

import { ViewPositionRoutesModule } from './view-position-routing.module';

import { ViewPositionComponent } from './view-position.component';

@NgModule({
    declarations: [ViewPositionComponent],
    imports: [
        CommonModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        ViewPositionRoutesModule,
        PositionModule,
    ],
})
export class ViewPositionModule {}
