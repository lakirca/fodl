import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';

import { GaugeModule } from 'angular-gauge';

import { FormatValuePipeModule } from '../../pipes/format-value/format-value.pipe.module';

import { IconPairPlatformModule } from '../icon-pair-platform/icon-pair-platform.module';
import { DialogModule } from '../dialog/dialog.module';

import { BotSettingsComponent } from './bot-settings.component';

@NgModule({
    declarations: [BotSettingsComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
        MatFormFieldModule,
        MatSlideToggleModule,
        MatSliderModule,
        GaugeModule,
        FormatValuePipeModule,
        DialogModule,
        IconPairPlatformModule,
    ],
    exports: [BotSettingsComponent],
})
export class BotSettingsModule {}
