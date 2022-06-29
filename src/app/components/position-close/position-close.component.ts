import { Router } from '@angular/router';
import { Component, Input } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';

import { DIALOG_MEDIUM } from '../../constants/commons';

import { IPosition } from '../../interfaces/position.interface';

import { FoldingService } from '../../services/folding/folding.service';
import { MarketsService } from '../../services/markets/markets.service';

import { TransactionComponent } from '../transaction/transaction.component';

@Component({
    selector: 'app-position-close',
    templateUrl: './position-close.component.html',
})
export class PositionCloseComponent {
    @Input() position: IPosition;
    @Input() redirect: boolean;

    constructor(
        public foldingService: FoldingService,
        private marketsService: MarketsService,
        private dialog: MatDialog,
        private router: Router,
    ) {}

    closePosition() {
        this.dialog.open(TransactionComponent, {
            width: DIALOG_MEDIUM,
            data: {
                title: 'Close Position',
                actionDescription: 'Accept transaction to close your position.',
                action: this.foldingService.calculateAndCloseSimplePosition(
                    this.position,
                ),
                callback: () => {
                    this.marketsService.getMarkets();
                    this.foldingService.getPositions();

                    if (this.redirect) this.router.navigate(['/positions']);
                },
            },
        });
    }
}
