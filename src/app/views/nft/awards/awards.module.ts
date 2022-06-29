import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { AwardsComponent } from './awards.component';

@NgModule({
    declarations: [AwardsComponent],
    imports: [CommonModule, HttpClientModule],
    exports: [AwardsComponent],
})
export class AwardsModule {}
