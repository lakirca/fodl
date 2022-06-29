import { Component, Inject } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Observable } from 'rxjs';

import { ConfigurationService } from '../../../services/configuration/configuration.service';

import { IPosition } from '../../../interfaces/position.interface';

@Component({
    selector: 'app-position-settings',
    templateUrl: './position-settings.component.html',
})
export class PositionSettingsComponent {
    stopLoss$: Observable<boolean>;
    pnlBot$: Observable<boolean>;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { position: IPosition },
        public dialogRef: MatDialogRef<PositionSettingsComponent>,
        private configurationService: ConfigurationService,
    ) {
        this.stopLoss$ = this.configurationService.getConfig('stopLoss');
        this.pnlBot$ = this.configurationService.getConfig('pnlBot');
    }
}
