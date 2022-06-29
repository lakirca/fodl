import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';

import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { filter, first } from 'rxjs/operators';

import { IPosition } from '../../interfaces/position.interface';

import POSITION from '../../../fixtures/position.json';

import { DIALOG_MEDIUM } from '../../constants/commons';

import { FoldingService } from '../../services/folding/folding.service';
import { MarketsService } from '../../services/markets/markets.service';

import { PositionSettingsComponent } from '../../components/positions-list/position-settings/position-settings.component';

@Component({
    selector: 'app-view-position',
    templateUrl: './view-position.component.html',
})
export class ViewPositionComponent implements OnInit, OnDestroy {
    subscription: Subscription;
    position$: BehaviorSubject<IPosition> = new BehaviorSubject<IPosition>(
        POSITION,
    );

    constructor(
        private dialog: MatDialog,
        private activatedRoute: ActivatedRoute,
        public marketsService: MarketsService,
        public foldingService: FoldingService,
    ) {}

    ngOnInit() {
        this.subscription = combineLatest([
            this.activatedRoute.params,
            this.foldingService.positions$,
        ])
            .pipe(filter(([_, positions]) => !!positions?.length))
            .subscribe(([params, positions]) =>
                this.position$.next({
                    ...positions.find(
                        (position) =>
                            position.positionAddress.toLowerCase() ===
                            params.positionAddress.toLowerCase(),
                    ),
                    ...params,
                }),
            );
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
    }

    onSetStopLoss(position: IPosition): void {
        const dialogRef = this.dialog.open(PositionSettingsComponent, {
            width: DIALOG_MEDIUM,
            data: {
                position,
            },
        });

        dialogRef
            .afterClosed()
            .pipe(first())
            .subscribe(() => {
                const dialog = this.dialog.getDialogById('stop-loss');

                if (dialog)
                    dialog
                        .afterClosed()
                        .pipe(first())
                        .subscribe(() =>
                            this.foldingService.positionsLoading$.next(true),
                        );
            });
    }
}
