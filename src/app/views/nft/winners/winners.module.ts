import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { WinnersComponent } from './winners.component';

@NgModule({
    declarations: [WinnersComponent],
    imports: [CommonModule, HttpClientModule],
    exports: [WinnersComponent],
})
export class WinnersModule {}
