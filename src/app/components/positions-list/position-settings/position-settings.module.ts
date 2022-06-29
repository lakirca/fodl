import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';

import { BotSettingsModule } from '../../bot-settings/bot-settings.module';
import { DialogModule } from '../../dialog/dialog.module';
import { StopLossSettingsModule } from '../../stop-loss-settings/stop-loss-settings.module';

import { PositionSettingsComponent } from './position-settings.component';

@NgModule({
    declarations: [PositionSettingsComponent],
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatTabsModule,
        BotSettingsModule,
        DialogModule,
        StopLossSettingsModule,
    ],
    exports: [PositionSettingsComponent],
})
export class PositionSettingsModule {}
