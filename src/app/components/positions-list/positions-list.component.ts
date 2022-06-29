import { Component } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';

import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import {
    debounceTime,
    distinctUntilChanged,
    filter,
    map,
} from 'rxjs/operators';

import { DIALOG_MEDIUM, LOADING_DEBOUNCE } from '../../constants/commons';

import { IPosition } from '../../interfaces/position.interface';

import { EthereumService } from '../../services/ethereum/ethereum.service';
import { FoldingService } from '../../services/folding/folding.service';

import { PositionSettingsComponent } from './position-settings/position-settings.component';

@Component({
    selector: 'app-positions-list',
    templateUrl: './positions-list.component.html',
    styleUrls: ['./positions-list.component.scss'],
})
export class PositionsListComponent {
    sortBy$: BehaviorSubject<string> = new BehaviorSubject<string>(
        'positionValueUsd',
    );

    showClosed$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    page$: BehaviorSubject<number> = new BehaviorSubject<number>(1);
    itemsPerPage$: BehaviorSubject<number> = new BehaviorSubject<number>(5);

    positions$: Observable<IPosition[]>;
    positionsPaginated$: Observable<IPosition[]>;
    positionsLoading$: Observable<boolean>;

    selects: IPosition[] = [];
    highlight: IPosition;

    constructor(
        private dialog: MatDialog,
        public ethereumService: EthereumService,
        public foldingService: FoldingService,
    ) {
        this.positionsLoading$ = combineLatest([
            foldingService.positionsLoading$,
            foldingService.accountsLoading$,
        ]).pipe(
            map(
                ([positionsLoading, accountsLoading]) =>
                    positionsLoading || accountsLoading,
            ),
            debounceTime(LOADING_DEBOUNCE),
        );

        this.positions$ = combineLatest([
            this.foldingService.positions$.pipe(
                distinctUntilChanged(),
                map((positions) =>
                    positions.map((position) => ({
                        ...position,
                        strategy:
                            position.supplyTokenAddress +
                            position.borrowTokenAddress,
                    })),
                ),
            ),
            this.sortBy$.pipe(distinctUntilChanged()),
            this.showClosed$,
        ]).pipe(
            map(([positions, sortBy, showClosed]) =>
                positions
                    .sort((a, b) => {
                        const direction = sortBy.startsWith('-') ? -1 : 1;
                        const column = sortBy.replace('-', '');

                        return a[column] < b[column] ? direction : -direction;
                    })
                    .filter(
                        (position) =>
                            position.positionValueUsd > (showClosed ? -1 : 5),
                    ),
            ),
        );

        this.positionsPaginated$ = combineLatest([
            this.positions$,
            this.page$,
            this.itemsPerPage$,
        ]).pipe(
            map(([positions, page, itemsPerPage]) =>
                positions.slice((page - 1) * itemsPerPage, page * itemsPerPage),
            ),
        );

        this.showClosed$
            .pipe(filter((showClosed) => !showClosed))
            .subscribe(() => this.page$.next(1));
    }

    sortBy(column: string) {
        if (column === this.sortBy$.getValue().replace('-', '')) {
            this.sortBy$.next(
                `${
                    this.sortBy$.getValue().startsWith('-') ? '' : '-'
                }${column}`,
            );
        } else {
            this.sortBy$.next(column);
        }
    }

    isPositionSelected(position: IPosition): boolean {
        return this.selects.includes(position);
    }

    toggleSelect(position: IPosition) {
        console.log('toggle position:', position);

        this.selects = this.isPositionSelected(position)
            ? [...this.selects.filter((select) => select !== position)]
            : (this.selects = [...this.selects, position]);
    }

    openPositionSettings(position: IPosition) {
        this.dialog.open(PositionSettingsComponent, {
            width: DIALOG_MEDIUM,
            data: {
                position,
            },
        });
    }
}
