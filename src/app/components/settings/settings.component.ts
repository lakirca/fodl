import { Component, Input, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import { first } from 'rxjs/operators';

import { SettingsService } from '../../services/settings/settings.service';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
    @Input() dialogRef?: MatDialogRef<any>;

    form: FormGroup;
    newNavigation: boolean;

    constructor(
        private settingsService: SettingsService,
        public fb: FormBuilder,
    ) {
        this.form = fb.group({
            slippage: ['', Validators.required],
        });
    }

    ngOnInit() {
        this.settingsService.settings$.pipe(first()).subscribe((settings) => {
            this.form.setValue({
                slippage: settings.slippage,
            });

            this.newNavigation = settings.navigation === 'new';
        });
    }

    save() {
        this.settingsService.settings$.next({
            ...this.form.value,
            navigation: this.newNavigation ? 'new' : 'old',
        });

        this.settingsService.save();

        if (this.dialogRef) {
            this.dialogRef.close();
        }
    }
}
