import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
} from '@angular/core';

import { MatDialog } from '@angular/material/dialog';

import {
    BehaviorSubject,
    combineLatest,
    Observable,
    of,
    Subscription,
} from 'rxjs';
import { distinctUntilChanged, filter, first, map } from 'rxjs/operators';

import { DIALOG_MEDIUM } from '../../../constants/commons';

import { IAsset } from '../../../interfaces/asset.interface';
import { IFoldingMarket, IMarket } from '../../../interfaces/market.interface';
import { IMarketAsset } from '../../../interfaces/marketAsset.interface';

import { ASSET_COMP, LONGABLE } from '../../../constants/blockchain';

import { getAssetSymbol } from '../../../utilities/asset';
import { convertMarketAsset } from '../../../utilities/convertMarketAsset';
import { formatNumber, formatValue } from '../../../utilities/format-value';
import { isMarketSafe } from '../../../utilities/marketSafe';
import { isStableCoin } from '../../../utilities/stableCoin';

import { EthereumService } from '../../../services/ethereum/ethereum.service';
import { FoldingService } from '../../../services/folding/folding.service';
import { MarketsService } from '../../../services/markets/markets.service';
import { MarketAssumptionService } from '../../../services/market-assumption/market-assumption.service';

import { TransactionComponent } from '../../transaction/transaction.component';

@Component({
    selector: 'app-enter-position-form',
    templateUrl: './enter-position-form.component.html',
    styleUrls: ['./enter-position-form.component.scss'],
})
export class EnterPositionFormComponent implements OnChanges, OnInit {
    @Input() supplyMarket: IMarket;
    @Input() leverage: number;
    @Input() maxLeverage: number;
    @Input() borrowAsset: IMarketAsset;

    @Output() supplyMarketChange: EventEmitter<IMarket> =
        new EventEmitter<IMarket>(undefined);

    allBorrowAssets$: BehaviorSubject<IMarketAsset[]> = new BehaviorSubject<
        IMarketAsset[]
    >(undefined);

    borrowAsset$: BehaviorSubject<IMarketAsset> =
        new BehaviorSubject<IMarketAsset>(undefined);

    borrowAssets$: Observable<IAsset[]>;

    allSupplyAssets: IAsset[];
    supplyAssets: IAsset[];

    supplyAmount: number;

    foldingMarket: IFoldingMarket;

    borrowAmount = 0;
    pnl = 0;

    simulateTransactionSubscription: Subscription;

    constructor(
        private cdr: ChangeDetectorRef,
        private dialog: MatDialog,
        public ethereumService: EthereumService,
        public foldingService: FoldingService,
        public marketsService: MarketsService,
        public marketAssumptionService: MarketAssumptionService,
    ) {}

    ngOnChanges(changes) {
        if (changes.supplyMarket) {
            this.marketsService.markets$
                .pipe(filter((markets) => !!markets))
                .subscribe((markets) =>
                    this.allBorrowAssets$.next(
                        markets
                            .filter(
                                (market) =>
                                    market?.platform.address.toLowerCase() ===
                                    this.supplyMarket?.platform.address.toLowerCase(),
                            )
                            .map((market) => convertMarketAsset(market)),
                    ),
                );

            this.restrictMaxLeverage();
        }

        if (changes.borrowAsset) {
            this.borrowAsset$.next(this.borrowAsset);
        }

        if (this.supplyMarket && this.borrowAsset$.getValue()) {
            this.foldingMarket = this.marketsService.findFoldingMarket(
                this.supplyMarket.platform.address,
                this.supplyMarket.assetAddress,
                this.borrowAsset$.getValue().asset.address,
            );
        }

        this.simulateTransaction();
    }

    ngOnInit() {
        this.borrowAssets$ = combineLatest([
            this.foldingService.strategy$,
            this.allBorrowAssets$.pipe(
                filter((allBorrowAssets) => !!allBorrowAssets),
            ),
        ]).pipe(
            map(([strategy, allBorrowAssets]) => {
                let borrowAssets: IMarketAsset[] = [];

                if (strategy === 'everything' || this.supplyMarket) {
                    borrowAssets = allBorrowAssets;
                } else if (strategy === 'long') {
                    borrowAssets = allBorrowAssets.filter((marketAsset) =>
                        isStableCoin(marketAsset.asset.address),
                    );
                } else if (strategy === 'short') {
                    borrowAssets = allBorrowAssets.filter((marketAsset) =>
                        LONGABLE.map((longable) =>
                            longable.address.toLowerCase(),
                        ).includes(marketAsset.asset.address.toLowerCase()),
                    );
                } else if (strategy === 'correlated') {
                    if (isStableCoin(this.supplyMarket.assetAddress)) {
                        borrowAssets = allBorrowAssets.filter((marketAsset) =>
                            isStableCoin(marketAsset.asset.address),
                        );
                    }

                    if (
                        LONGABLE.map((longable) =>
                            longable.address.toLowerCase(),
                        ).includes(this.supplyMarket.assetAddress.toLowerCase())
                    ) {
                        borrowAssets = allBorrowAssets.filter((marketAsset) =>
                            LONGABLE.map((longable) =>
                                longable.address.toLowerCase(),
                            ).includes(marketAsset.asset.address.toLowerCase()),
                        );
                    }

                    if (
                        !borrowAssets
                            .map((marketAsset) =>
                                marketAsset.asset.address.toLowerCase(),
                            )
                            .includes(
                                this.supplyMarket.assetAddress.toLowerCase(),
                            )
                    ) {
                        borrowAssets = [
                            ...borrowAssets,
                            allBorrowAssets.find(
                                (marketAsset) =>
                                    marketAsset.asset.address.toLowerCase() ===
                                    this.supplyMarket.assetAddress.toLowerCase(),
                            ),
                        ];
                    }
                }

                return borrowAssets
                    .map((borrowAsset) => borrowAsset.asset)
                    .filter(
                        (asset) =>
                            asset.platformAddress.toLowerCase() ===
                            this.supplyMarket.platform.address.toLowerCase(),
                    )
                    .filter(
                        (asset) =>
                            asset.address.toLowerCase() !==
                            ASSET_COMP.address.toLowerCase(),
                    );
            }),
        );

        this.borrowAssets$.subscribe(() =>
            this.ensureSelectedBorrowAssetExists(),
        );

        this.marketsService.markets$.subscribe(() => {
            if (this.supplyMarket) {
                this.supplyMarket = this.marketsService.findMarket(
                    this.supplyMarket.platform.address,
                    this.supplyMarket.assetAddress,
                );

                this.cdr.detectChanges();
            }
        });

        this.marketsService.markets$
            .pipe(
                filter((markets) => !!markets),
                map((markets) =>
                    markets
                        .filter((market) => !!market.collateralFactor)
                        .map((market) => convertMarketAsset(market).asset),
                ),
            )
            .subscribe((assets) => {
                this.allSupplyAssets = assets;
                this.supplyAssets = this.allSupplyAssets;

                if (!this.supplyMarket) {
                    this.supplyMarket = this.marketsService.findMarket(
                        this.ethereumService.getNetworkSpecificDefaultPlatform(),
                        this.ethereumService.getNetworkSpecificDefaultSupplyAsset()
                            .address,
                    );
                }

                if (this.supplyMarket) {
                    this.handleSupplyAssetChange(
                        this.supplyAssets.find(
                            (supplyAsset) =>
                                supplyAsset.platformAddress.toLowerCase() ===
                                    this.supplyMarket.platform.address.toLowerCase() &&
                                supplyAsset.address.toLowerCase() ===
                                    this.supplyMarket.assetAddress.toLowerCase(),
                        ),
                    );
                }
            });

        if (!this.leverage) {
            this.leverage = 2;
        }
    }

    async setMaxSupplyAmount() {
        this.supplyAmount = formatNumber(
            this.supplyMarket.walletBalance,
            this.supplyMarket.assetSymbol,
        );

        this.simulateTransaction();
    }

    handleBorrowAssetChange(asset: IAsset) {
        if (asset) {
            this.allBorrowAssets$.subscribe((allBorrowAssets) => {
                this.borrowAsset$.next(
                    allBorrowAssets.find(
                        (borrowAsset) =>
                            borrowAsset.asset.address.toLowerCase() ===
                            asset.address.toLowerCase(),
                    ),
                );

                this.foldingMarket = this.marketsService.findFoldingMarket(
                    this.supplyMarket.platform.address,
                    this.supplyMarket.assetAddress,
                    this.borrowAsset$.getValue().asset.address,
                );

                this.simulateTransaction();
            });
        }
    }

    getSupplyAsset(): IAsset {
        return this.supplyAssets && this.supplyMarket
            ? this.supplyAssets.find(
                  (supplyAsset) =>
                      supplyAsset.address === this.supplyMarket.assetAddress &&
                      supplyAsset.platformAddress ===
                          this.supplyMarket.platform.address,
              )
            : undefined;
    }

    handleSupplyAssetChange(asset: IAsset) {
        if (asset) {
            this.supplyMarket = this.marketsService.findMarket(
                asset.platformAddress,
                asset.address,
            );

            this.restrictMaxLeverage();

            this.simulateTransaction();

            this.supplyMarketChange.emit(this.supplyMarket);
        }
    }

    restrictMaxLeverage() {
        if (this.supplyMarket) {
            this.maxLeverage = this.marketsService.getMaxLeverage(
                this.supplyMarket.collateralFactor,
            );

            if (this.leverage > this.maxLeverage) {
                this.leverage = this.maxLeverage;
            }
        }
    }

    handleStrategyChange(strategy: string) {
        this.foldingService.strategy$.next(strategy);

        if (
            this.foldingService.strategy$.getValue() === 'everything' ||
            this.foldingService.strategy$.getValue() === 'correlated'
        ) {
            this.supplyAssets = this.allSupplyAssets;
        } else if (this.foldingService.strategy$.getValue() === 'long') {
            this.supplyAssets = this.allSupplyAssets.filter((asset) =>
                LONGABLE.map((longable) =>
                    longable.address.toLowerCase(),
                ).includes(asset.address.toLowerCase()),
            );
        } else if (this.foldingService.strategy$.getValue() === 'short') {
            this.supplyAssets = this.allSupplyAssets.filter((asset) =>
                isStableCoin(asset.address),
            );
        }

        if (this.leverage < this.getMinLeverage()) {
            this.leverage = this.getMinLeverage();
        }

        this.ensureSelectedSupplyAssetExists();
        this.ensureSelectedBorrowAssetExists();
    }

    ensureSelectedSupplyAssetExists() {
        if (
            !this.supplyAssets
                .map((supplyAsset) => supplyAsset.address.toLowerCase())
                .includes(this.supplyMarket.assetAddress.toLowerCase())
        ) {
            this.handleSupplyAssetChange(
                this.supplyAssets.find(
                    (asset) =>
                        asset.address.toLowerCase() ===
                        this.ethereumService
                            .getNetworkSpecificDefaultSupplyAsset()
                            .address.toLowerCase(),
                ) || this.supplyAssets[0],
            );
        }
    }

    ensureSelectedBorrowAssetExists() {
        this.borrowAssets$.pipe(first()).subscribe((borrowAssets) => {
            if (
                !this.borrowAsset$.getValue() ||
                (this.borrowAsset$.getValue() &&
                    !borrowAssets.find(
                        (borrowAsset) =>
                            borrowAsset.platformAddress.toLowerCase() ===
                                this.borrowAsset$
                                    .getValue()
                                    .asset.platformAddress.toLowerCase() &&
                            borrowAsset.address.toLowerCase() ===
                                this.borrowAsset$
                                    .getValue()
                                    .asset.address.toLowerCase(),
                    ))
            ) {
                this.handleBorrowAssetChange(
                    borrowAssets.find(
                        (asset) =>
                            asset.address.toLowerCase() ===
                            this.ethereumService
                                .getNetworkSpecificDefaultBorrowAsset()
                                .address.toLowerCase(),
                    ) || borrowAssets[0],
                );
            }
        });
    }

    getMinLeverage(): number {
        return this.foldingService.strategy$.getValue() === 'everything'
            ? 1.1
            : 2;
    }

    getApr(): Observable<number> {
        if (this.supplyMarket && this.borrowAsset$.getValue()) {
            return combineLatest([
                this.foldingService.strategy$,
                this.marketAssumptionService.asNumber$,
            ]).pipe(
                map(
                    ([strategy, marketAssumption]) =>
                        (this.leverage *
                            (this.supplyMarket.supplyAPR +
                                this.supplyMarket.supplyRewardsAPR) -
                            this.leverage * this.borrowAsset$.getValue().apy) *
                            100 +
                        (this.foldingMarket && this.foldingMarket.totalValue
                            ? this.marketsService.getFodlApr(
                                  this.foldingMarket.totalValue,
                                  this.leverage,
                                  isMarketSafe(
                                      this.foldingMarket.supplyMarket.assetAddress.toLowerCase(),
                                      this.foldingMarket.borrowAsset.asset.address.toLowerCase(),
                                  ),
                              )
                            : 0) +
                        (strategy === 'long' || strategy === 'short'
                            ? marketAssumption * this.leverage
                            : 0),
                ),
            );
        }

        return of(0);
    }

    simulateTransaction() {
        if (this.supplyAmount && this.borrowAsset$.getValue()) {
            if (this.simulateTransactionSubscription) {
                this.simulateTransactionSubscription.unsubscribe();
            }

            this.simulateTransactionSubscription = this.foldingService
                .getBorrowAmountForPosition(
                    this.supplyMarket.platform.address,
                    this.supplyMarket.assetAddress,
                    this.supplyAmount,
                    this.leverage,
                    this.borrowAsset$.getValue().asset.address,
                )
                .subscribe(([borrowAmount, pnl]) => {
                    this.borrowAmount = borrowAmount;
                    this.pnl = pnl;
                });
        } else {
            this.borrowAmount = 0;
        }
    }

    enterPosition() {
        this.foldingService
            .createFoldingAccount(true)
            .subscribe((account: string) =>
                this.dialog.open(TransactionComponent, {
                    width: DIALOG_MEDIUM,
                    data: {
                        title: 'Open Leverage Position',
                        actionDescription: `Please sign a transaction to send ${formatValue(
                            this.supplyAmount,
                        )} ${getAssetSymbol(
                            this.supplyMarket.assetAddress,
                        )} to be used as a principal investment.`,
                        approveAccount: account,
                        approveToken: this.supplyMarket.assetAddress,
                        approveAmount: this.supplyAmount,
                        callback: () => {
                            this.supplyAmount = 0;
                            this.borrowAmount = 0;
                            this.pnl = 0;

                            this.marketsService.getMarkets();

                            this.marketsService.markets$
                                .pipe(distinctUntilChanged())
                                .subscribe(
                                    () =>
                                        (this.supplyMarket =
                                            this.marketsService.findMarket(
                                                this.supplyMarket.platform
                                                    .address,
                                                this.supplyMarket.assetAddress,
                                            )),
                                );
                        },
                        action: this.foldingService.calculateAndIncreaseSimplePosition(
                            this.supplyMarket.platform.address,
                            this.supplyMarket.assetAddress,
                            this.supplyAmount,
                            this.leverage,
                            this.borrowAsset$.getValue().asset.address,
                        ),
                    },
                }),
            );
    }

    disableEnterPositionButton(): boolean {
        return (
            this.supplyAmount > (this.supplyMarket?.walletBalance as number) ||
            !(this.borrowAmount >= 0) ||
            !this.supplyAmount ||
            !this.supplyAmount
        );
    }
}
