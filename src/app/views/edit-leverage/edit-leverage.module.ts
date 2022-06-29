import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PositionModule } from '../../components/position/position.module';

import { EditLeverageRoutesModule } from './edit-leverage-routing.module';

import { EditLeverageComponent } from './edit-leverage.component';

@NgModule({
    declarations: [EditLeverageComponent],
    imports: [
        CommonModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        EditLeverageRoutesModule,
        PositionModule,
    ],
})
export class EditLeverageModule {}
