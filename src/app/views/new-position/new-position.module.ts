import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PositionModule } from '../../components/position/position.module';

import { LeverageService } from '../../services/leverage/leverage.service';

import { NewPositionRoutesModule } from './new-position-routing.module';

import { NewPositionComponent } from './new-position.component';

@NgModule({
    declarations: [NewPositionComponent],
    imports: [CommonModule, NewPositionRoutesModule, PositionModule],
    providers: [LeverageService],
})
export class NewPositionModule {}
