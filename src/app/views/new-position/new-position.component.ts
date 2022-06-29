import { ActivatedRoute } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import POSITION from '../../../fixtures/position.json';

import { IPosition } from './../../interfaces/position.interface';

import { MarketsService } from '../../services/markets/markets.service';
import { FoldingService } from '../../services/folding/folding.service';
import { EthereumService } from 'src/app/services/ethereum/ethereum.service';

@Component({
    selector: 'app-new-position',
    templateUrl: './new-position.component.html',
})
export class NewPositionComponent implements OnInit, OnDestroy {
    subscription: Subscription;
    position$: BehaviorSubject<IPosition> = new BehaviorSubject<IPosition>(
        POSITION,
    );

    constructor(
        public marketsService: MarketsService,
        private ethereumService: EthereumService,
        public foldingService: FoldingService,
        private activatedRoute: ActivatedRoute,
    ) {}

    ngOnInit() {
        this.subscription = combineLatest([
            this.activatedRoute.params,
            this.marketsService.markets$,
        ])
            .pipe(filter(([_, markets]) => !!markets?.length))
            .subscribe(([params]) =>
                this.position$.next({
                    ...POSITION,
                    platformAddress: params.platform || undefined,
                    borrowMarket:
                        params.platform && params.borrowAsset
                            ? this.marketsService.findMarket(
                                  params.platform,
                                  params.borrowAsset,
                              )
                            : this.marketsService.findMarket(
                                  this.ethereumService.getNetworkSpecificDefaultPlatform(),
                                  this.ethereumService.getNetworkSpecificDefaultSupplyAsset()
                                      .address,
                              ),
                    supplyMarket:
                        params.platform && params.supplyAsset
                            ? this.marketsService.findMarket(
                                  params.platform,
                                  params.supplyAsset,
                              )
                            : this.marketsService.findMarket(
                                  this.ethereumService.getNetworkSpecificDefaultPlatform(),
                                  this.ethereumService.getNetworkSpecificDefaultBorrowAsset()
                                      .address,
                              ),
                    leverage: params.leverage ? params.leverage : 1,
                }),
            );
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
    }
}
