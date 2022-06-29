import { Component, Input } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';

import { DIALOG_MEDIUM, DIALOG_SMALL } from '../../constants/commons';

import { IPosition } from '../../interfaces/position.interface';
import { IPositionDetails } from '../../interfaces/positionDetails.interface';

import { capitalizeFirstLetter } from '../../utilities/capitalize';

import { FoldingService } from '../../services/folding/folding.service';

import { PositionSettingsComponent } from '../positions-list/position-settings/position-settings.component';
import { SettingsDialogComponent } from '../settings-dialog/settings-dialog.component';

@Component({
    selector: 'app-position',
    templateUrl: './position.component.html',
})
export class PositionComponent {
    @Input() position: IPosition;
    @Input() edit?: string;

    positionDetails: IPositionDetails;

    constructor(
        private dialog: MatDialog,
        public foldingService: FoldingService,
    ) {}

    goBack() {
        window.history.back();
    }

    openSettings() {
        this.dialog.open(SettingsDialogComponent, { width: DIALOG_SMALL });
    }

    openStopLoss() {
        this.dialog.open(PositionSettingsComponent, {
            width: DIALOG_MEDIUM,
            data: {
                position: this.position,
            },
        });
    }

    getFormTitle(): string {
        switch (this.edit) {
            case undefined:
                return 'View Position';

            case 'all':
                return 'Open Position';

            default:
                return `Change ${capitalizeFirstLetter(this.edit)}`;
        }
    }
}
