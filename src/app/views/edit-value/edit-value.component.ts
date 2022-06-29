import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { IPosition } from '../../interfaces/position.interface';

import POSITION from '../../../fixtures/position.json';

import { FoldingService } from '../../services/folding/folding.service';
import { MarketsService } from '../../services/markets/markets.service';

@Component({
    selector: 'app-edit-value',
    templateUrl: './edit-value.component.html',
})
export class EditValueComponent implements OnInit, OnDestroy {
    subscription: Subscription;
    position$: BehaviorSubject<IPosition> = new BehaviorSubject<IPosition>(
        POSITION,
    );

    constructor(
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
                this.position$.next(
                    positions.find(
                        (position) =>
                            position.positionAddress.toLowerCase() ===
                            params.positionAddress.toLowerCase(),
                    ),
                ),
            );
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
    }
}
