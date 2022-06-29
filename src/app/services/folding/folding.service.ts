import { Injectable } from '@angular/core';

import { ethers } from 'ethers';

import { BehaviorSubject, from, Observable, of } from 'rxjs';
import {
    catchError,
    debounceTime,
    filter,
    first,
    map,
    switchMap,
    tap,
} from 'rxjs/operators';

import { IErrorMessageData } from '../../interfaces/errorMessageData.interface';
import {
    IIncreaseSimplePosition,
    IIncreaseSimplePositionWithLoop,
} from '../../interfaces/increasePosition.interface';
import {
    IDecreaseSimplePosition,
    IDecreaseSimplePositionWithLoop,
} from '../../interfaces/decreasePosition.interface';
import { IPosition } from '../../interfaces/position.interface';
import { IPositionDetails } from '../../interfaces/positionDetails.interface';

import { NETWORK_INTERVAL } from '../../constants/commons';
import { ZERO_ADDRESS } from '../../constants/blockchain';

import { getAssetSymbol } from '../../utilities/asset';
import { convertToBigNumber, parseBigNumber } from '../../utilities/big-number';
import { isMarketSafe } from '../../utilities/marketSafe';

import { ERC20Service } from '../erc20/erc20.service';
import { EthereumService } from '../ethereum/ethereum.service';
import { GeckoPriceService } from '../gecko-price/gecko-price.service';
import { MarketsService } from '../markets/markets.service';

import { FoldingPositionsService } from './foldingPositions/foldingPositions.service';
import { FoldingRegistryService } from './foldingRegistry/foldingRegistry.service';

@Injectable()
export class FoldingService {
    positionsLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        false,
    );
    positions$: BehaviorSubject<IPosition[]> = new BehaviorSubject<IPosition[]>(
        [],
    );

    accounts$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
    accountsLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        true,
    );

    borrowAmountRecalculating$: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false);

    strategy$: BehaviorSubject<string> = new BehaviorSubject<string>(
        'everything',
    );

    error$: Observable<string>;

    constructor(
        private erc20service: ERC20Service,
        private ethereumService: EthereumService,
        private foldingPositionsService: FoldingPositionsService,
        private foldingRegistryService: FoldingRegistryService,
        private geckoPriceService: GeckoPriceService,
        private marketsService: MarketsService,
    ) {
        this.error$ = this.ethereumService.connected$.pipe(
            debounceTime(NETWORK_INTERVAL),
            map((value) =>
                !value ? 'Not connected to blockchain.' : undefined,
            ),
        );

        // Handle Network Disconnect
        this.ethereumService.connected$
            .pipe(filter((connected) => !connected))
            .subscribe(() => {
                this.accounts$.next([]);
                this.positions$.next([]);
            });

        // Handle Network Connect
        this.ethereumService.connected$
            .pipe(
                filter((connected) => !!connected),
                switchMap(() => this.accounts$),
                filter((accounts) => !!accounts.length),
            )
            .subscribe(() => this.getPositions());

        this.marketsService.markets$
            .pipe(filter((markets) => !!markets?.length))
            .subscribe(() => this.getFoldingAccounts());
    }

    getFoldingAccounts() {
        this.ethereumService.account$
            .pipe(filter((account) => !account))
            .subscribe(() => {
                this.accounts$.next([]);
                this.positions$.next([]);

                this.accountsLoading$.next(false);
            });

        const wa = window.location.href.match(/wa=(.*)/);

        if (wa) {
            from(
                this.foldingRegistryService.getFoldingAccounts(wa[1]),
            ).subscribe((accounts) => {
                this.accounts$.next(accounts);

                this.accountsLoading$.next(false);
            });
        } else {
            this.ethereumService.account$
                .pipe(
                    filter((account) => !!account),
                    switchMap((account) =>
                        from(
                            this.foldingRegistryService.getFoldingAccounts(
                                account,
                            ),
                        ),
                    ),
                    first(),
                )
                .subscribe((accounts) => {
                    this.accounts$.next(accounts);

                    this.accountsLoading$.next(false);
                });
        }
    }

    getPositions() {
        const accounts = this.accounts$.getValue();
        const markets = this.marketsService.markets$.getValue();

        if (accounts && markets) {
            this.positionsLoading$.next(true);

            from(this.foldingPositionsService.getPositions(accounts))
                .pipe(first())
                .subscribe(async (positions) => {
                    this.positions$.next(
                        await Promise.all(
                            positions.map(async (position) => {
                                const borrowMarket =
                                    this.marketsService.findMarket(
                                        position.platformAddress,
                                        position.borrowTokenAddress,
                                    );

                                const totalBorrowAPR =
                                    borrowMarket?.borrowAPR -
                                    borrowMarket?.borrowRewardsAPR;

                                const supplyMarket =
                                    this.marketsService.findMarket(
                                        position.platformAddress,
                                        position.supplyTokenAddress,
                                    );

                                const leverageBigNumber =
                                    position.positionValueBigNumber.isZero()
                                        ? convertToBigNumber(1)
                                        : position.supplyAmountBigNumber
                                              .mul(convertToBigNumber(1))
                                              .div(
                                                  position.positionValueBigNumber,
                                              )
                                              .sub(convertToBigNumber(1));

                                const leverage =
                                    parseBigNumber(leverageBigNumber);

                                const totalSupplyAPR =
                                    leverage *
                                    (supplyMarket?.supplyAPR +
                                        supplyMarket?.supplyRewardsAPR);

                                const foldingMarket =
                                    this.marketsService.findFoldingMarket(
                                        position.platformAddress,
                                        position.supplyTokenAddress,
                                        position.borrowTokenAddress,
                                    );

                                const fodlApr =
                                    foldingMarket && foldingMarket.totalValue
                                        ? this.marketsService.getFodlApr(
                                              foldingMarket.totalValue,
                                              leverage,
                                              isMarketSafe(
                                                  foldingMarket.supplyMarket.assetAddress.toLowerCase(),
                                                  foldingMarket.borrowAsset.asset.address.toLowerCase(),
                                              ),
                                          )
                                        : 0;

                                const apr =
                                    (totalSupplyAPR -
                                        leverage * totalBorrowAPR) *
                                        100 +
                                    fodlApr;

                                const positionValue = parseBigNumber(
                                    position.positionValueBigNumber,
                                    supplyMarket.assetDecimals,
                                );

                                const principalValue = parseBigNumber(
                                    position.principalValueBigNumber,
                                    supplyMarket.assetDecimals,
                                );

                                const supplyAmount = parseBigNumber(
                                    position.supplyAmountBigNumber,
                                    supplyMarket.assetDecimals,
                                );

                                const supplyAmountUsd =
                                    supplyAmount * supplyMarket.assetUsdValue;

                                const borrowAmount = parseBigNumber(
                                    position.borrowAmountBigNumber,
                                    borrowMarket.assetDecimals,
                                );

                                const borrowAmountUsd =
                                    borrowAmount * borrowMarket.assetUsdValue;

                                const currentPrice = parseBigNumber(
                                    borrowMarket.assetUsdValueBigNumber
                                        .mul(convertToBigNumber(1))
                                        .div(
                                            supplyMarket.assetUsdValueBigNumber,
                                        ),
                                );

                                const principalValueUsd =
                                    principalValue * supplyMarket.assetUsdValue;

                                const [asset, amount] =
                                    await this.foldingPositionsService.getRewards(
                                        position.positionAddress,
                                    );

                                const rewardsUSD =
                                    parseBigNumber(
                                        amount,
                                        await this.erc20service.getDecimals(
                                            asset,
                                        ),
                                    ) *
                                    (await this.geckoPriceService.getERC20Price(
                                        asset,
                                    ));

                                const rewardsPnl =
                                    (rewardsUSD / principalValueUsd) * 100;

                                return {
                                    ...position,
                                    apr,
                                    leverage,
                                    leverageBigNumber,
                                    borrowMarket,
                                    borrowAmount,
                                    borrowAmountUsd,
                                    supplyMarket,
                                    supplyAmount,
                                    supplyAmountUsd,
                                    positionValue,
                                    positionValueUsd:
                                        positionValue *
                                        supplyMarket.assetUsdValue,
                                    principalValue,
                                    principalValueUsd,
                                    foldingMarket:
                                        this.marketsService.findFoldingMarket(
                                            position.platformAddress,
                                            position.supplyTokenAddress,
                                            position.borrowTokenAddress,
                                        ),
                                    currentPrice,
                                    pnl:
                                        (positionValue / principalValue) * 100 -
                                        100,
                                    rewardsPnl,
                                };
                            }),
                        ),
                    );

                    this.positionsLoading$.next(false);
                });
        } else {
            this.positions$.next([]);
        }
    }

    getPosition(positionAddress: string): Observable<IPosition> {
        return this.positions$.pipe(
            map((positions) =>
                positions.find(
                    (position) =>
                        position.positionAddress.toLowerCase() ===
                        positionAddress.toLowerCase(),
                ),
            ),
        );
    }

    getBorrowAmountForPosition(
        platform: string,
        supplyToken: string,
        supplyAmount: number,
        leverage: number,
        borrowToken: string,
    ) {
        this.borrowAmountRecalculating$.next(true);

        return this.ethereumService.isEthereumNetwork()
            ? this.calculateIncreaseSimplePosition(
                  platform,
                  supplyToken,
                  supplyAmount,
                  leverage,
                  borrowToken,
              ).pipe(
                  map((output) => [output.borrowAmount, output.executionPrice]),
                  filter(([borrowAmount, _]) => !!borrowAmount),
                  switchMap(([borrowAmount, executionPrice]) =>
                      from(
                          this.erc20service.getTokenAmount(
                              borrowToken,
                              borrowAmount as ethers.BigNumber,
                          ),
                      ).pipe(
                          map((borrowAmount) => [borrowAmount, executionPrice]),
                      ),
                  ),
                  catchError((output, error) =>
                      error ? of([undefined, undefined]) : output,
                  ),
                  tap(() => this.borrowAmountRecalculating$.next(false)),
              )
            : this.calculateIncreaseSimplePositionWithLoop(
                  platform,
                  supplyToken,
                  supplyAmount,
                  leverage,
                  borrowToken,
              ).pipe(
                  map((output) => [
                      output.totalBorrowAmount,
                      output.executionPrice,
                  ]),
                  filter(([totalBorrowAmount, _]) => !!totalBorrowAmount),
                  switchMap(([totalBorrowAmount, executionPrice]) =>
                      from(
                          this.erc20service.getTokenAmount(
                              borrowToken,
                              totalBorrowAmount as ethers.BigNumber,
                          ),
                      ).pipe(
                          map((totalBorrowAmount) => [
                              totalBorrowAmount,
                              executionPrice,
                          ]),
                      ),
                  ),
                  catchError((output, error) =>
                      error ? of([undefined, undefined]) : output,
                  ),
                  tap(() => this.borrowAmountRecalculating$.next(false)),
              );
    }

    createFoldingAccount(
        simulate?: boolean,
    ): Observable<Object | IErrorMessageData> {
        return from(this.foldingRegistryService.createFoldingAccount(simulate));
    }

    approveAllowance(
        account: string,
        approveToken: string,
        approveAlowance?: number,
    ): Observable<Object | IErrorMessageData> {
        return from(
            this.erc20service.approveAllowance(
                account,
                approveToken,
                approveAlowance,
            ),
        );
    }

    calculateAndIncreaseSimplePosition(
        platform: string,
        principalToken: string,
        principalAmount: number,
        leverage: number,
        borrowToken: string,
        account?: string,
    ): Observable<Object | IErrorMessageData> {
        return from(
            this.ethereumService.isEthereumNetwork()
                ? this.foldingPositionsService.calculateIncreaseSimplePosition(
                      platform,
                      principalToken,
                      principalAmount,
                      leverage,
                      borrowToken,
                  )
                : this.foldingPositionsService.calculateIncreaseSimplePositionWithLoop(
                      platform,
                      principalToken,
                      principalAmount,
                      leverage,
                      borrowToken,
                  ),
        ).pipe(
            catchError((error) => of({ error })),
            map((params) => (account ? { ...params, account } : params)),
            switchMap((params) =>
                from(
                    this.ethereumService.isEthereumNetwork()
                        ? this.foldingPositionsService.increaseSimplePosition(
                              params as IIncreaseSimplePosition,
                          )
                        : this.foldingPositionsService.increaseSimplePositionWithLoop(
                              params as IIncreaseSimplePositionWithLoop,
                          ),
                ),
            ),
        );
    }

    calculateAndDecreaseSimplePosition(position: IPosition, amount: number) {
        return from(
            this.ethereumService.isEthereumNetwork()
                ? this.foldingPositionsService.calculateDecreaseSimplePosition(
                      position,
                      amount,
                  )
                : this.foldingPositionsService.calculateDecreaseSimplePositionWithLoop(
                      position,
                      amount,
                  ),
        ).pipe(
            catchError((error) => of({ error })),
            map((params) => ({ ...params, account: position.positionAddress })),
            switchMap((params) =>
                from(
                    this.ethereumService.isEthereumNetwork()
                        ? this.foldingPositionsService.decreaseSimplePosition(
                              params as IDecreaseSimplePosition,
                          )
                        : this.foldingPositionsService.decreaseSimplePositionWithLoop(
                              params as IDecreaseSimplePositionWithLoop,
                          ),
                ),
            ),
        );
    }

    calculateAndIncreaseSimplePositionLeverage(
        position: IPosition,
        leverage: number,
    ) {
        return from(
            this.ethereumService.isEthereumNetwork()
                ? this.foldingPositionsService.calculateIncreaseSimplePositionByLeverage(
                      position,
                      leverage,
                  )
                : this.foldingPositionsService.calculateIncreaseSimplePositionByLeverageWithLoop(
                      position,
                      leverage,
                  ),
        ).pipe(
            catchError((error) => of({ error })),
            map((params) => ({ ...params, account: position.positionAddress })),
            switchMap((params) =>
                from(
                    this.ethereumService.isEthereumNetwork()
                        ? this.foldingPositionsService.increaseSimplePosition(
                              params as IIncreaseSimplePosition,
                          )
                        : this.foldingPositionsService.increaseSimplePositionWithLoop(
                              params as IIncreaseSimplePositionWithLoop,
                          ),
                ),
            ),
        );
    }

    calculateAndDecreaseSimplePositionLeverage(
        position: IPosition,
        leverage: number,
    ) {
        return from(
            this.ethereumService.isEthereumNetwork()
                ? this.foldingPositionsService.calculateDecreaseSimplePositionByLeverage(
                      position,
                      leverage,
                  )
                : this.foldingPositionsService.calculateDecreaseSimplePositionByLeverageWithLoop(
                      position,
                      leverage,
                  ),
        ).pipe(
            catchError((error) => of({ error })),
            map((params) => ({ ...params, account: position.positionAddress })),
            switchMap((params) =>
                from(
                    this.ethereumService.isEthereumNetwork()
                        ? this.foldingPositionsService.decreaseSimplePosition(
                              params as IDecreaseSimplePosition,
                          )
                        : this.foldingPositionsService.decreaseSimplePositionWithLoop(
                              params as IDecreaseSimplePositionWithLoop,
                          ),
                ),
            ),
        );
    }

    calculateAndCloseSimplePosition(position: IPosition) {
        return from(
            this.ethereumService.isEthereumNetwork()
                ? this.foldingPositionsService.calculateCloseSimplePosition(
                      position,
                  )
                : this.foldingPositionsService.calculateCloseSimplePositionWithLoop(
                      position,
                  ),
        ).pipe(
            catchError((error) => of({ error })),
            map((params) => ({ ...params, account: position.positionAddress })),
            switchMap((params) =>
                from(
                    this.ethereumService.isEthereumNetwork()
                        ? this.foldingPositionsService.decreaseSimplePosition(
                              params as IDecreaseSimplePosition,
                          )
                        : this.foldingPositionsService.decreaseSimplePositionWithLoop(
                              params as IDecreaseSimplePositionWithLoop,
                          ),
                ),
            ),
        );
    }

    getRewardsAmount(account: string): Observable<number> {
        return from(this.foldingPositionsService.getRewards(account)).pipe(
            filter(([asset, _]) => asset !== ZERO_ADDRESS),
            switchMap(([asset, amount]) =>
                from(this.erc20service.getTokenAmount(asset, amount)),
            ),
        );
    }

    getRewardsSymbol(account: string): Observable<string> {
        return from(this.foldingPositionsService.getRewards(account)).pipe(
            map(([asset, _]) => getAssetSymbol(asset)),
        );
    }

    claimRewards(account: string): Observable<Object | IErrorMessageData> {
        return from(this.foldingPositionsService.claimRewards(account));
    }

    getStopLossConfiguration(
        account: string,
    ): Observable<[ethers.BigNumber, ethers.BigNumber, ethers.BigNumber]> {
        return from(
            this.foldingPositionsService.getStopLossConfiguration(account),
        );
    }

    getAllPNLSettings(
        account: string,
    ): Observable<
        [
            ethers.BigNumber,
            ethers.BigNumber,
            ethers.BigNumber,
            ethers.BigNumber,
            boolean,
        ][]
    > {
        return from(this.foldingPositionsService.getAllPNLSettings(account));
    }

    configureStopLoss(
        account: string,
        unwindFactor: ethers.BigNumber,
        slippageIncentive: ethers.BigNumber,
        collateralUsageLimit: ethers.BigNumber,
    ): Observable<Object | IErrorMessageData> {
        return from(
            this.foldingPositionsService.configureStopLoss(
                account,
                unwindFactor,
                slippageIncentive,
                collateralUsageLimit,
            ),
        );
    }

    configurePNL(
        account: string,
        priceTarget: ethers.BigNumber,
        fixedReward: ethers.BigNumber,
        percentageReward: ethers.BigNumber,
        unwindFactor: ethers.BigNumber,
        isTakeProfit: boolean,
    ): Observable<Object | IErrorMessageData> {
        return from(
            this.foldingPositionsService.configurePNL(
                account,
                priceTarget,
                fixedReward,
                percentageReward,
                unwindFactor,
                isTakeProfit,
            ),
        );
    }

    // LEGACY CODE:

    calculateIncreaseSimplePosition(
        platform: string,
        principalToken: string,
        principalAmount: number,
        leverage: number,
        borrowToken: string,
    ): Observable<IIncreaseSimplePosition> {
        return from(
            this.foldingPositionsService.calculateIncreaseSimplePosition(
                platform,
                principalToken,
                principalAmount,
                leverage,
                borrowToken,
            ),
        );
    }

    calculateIncreaseSimplePositionWithLoop(
        platform: string,
        principalToken: string,
        principalAmount: number,
        leverage: number,
        borrowToken: string,
    ): Observable<IIncreaseSimplePositionWithLoop> {
        return from(
            this.foldingPositionsService.calculateIncreaseSimplePositionWithLoop(
                platform,
                principalToken,
                principalAmount,
                leverage,
                borrowToken,
            ),
        );
    }

    calculateDecreaseSimplePosition(
        position: IPosition,
        amount: number,
    ): Observable<IDecreaseSimplePosition> {
        return from(
            this.foldingPositionsService.calculateDecreaseSimplePosition(
                position,
                amount,
            ),
        );
    }

    calculateCloseSimplePosition(
        position: IPosition,
    ): Observable<IDecreaseSimplePosition> {
        return from(
            this.foldingPositionsService.calculateCloseSimplePosition(position),
        );
    }

    calculateIncreaseSimplePositionByLeverage(
        position: IPosition,
        leverage: number,
    ): Observable<IIncreaseSimplePosition> {
        return from(
            this.foldingPositionsService.calculateIncreaseSimplePositionByLeverage(
                position,
                leverage,
            ),
        );
    }

    calculateDecreaseSimplePositionByLeverage(
        position: IPosition,
        leverage: number,
    ): Observable<IDecreaseSimplePosition> {
        return from(
            this.foldingPositionsService.calculateDecreaseSimplePositionByLeverage(
                position,
                leverage,
            ),
        );
    }

    increaseSimplePosition(
        params: IIncreaseSimplePosition,
    ): Observable<Object | IErrorMessageData> {
        return (
            params.account
                ? of(params.account)
                : this.createFoldingAccount(true)
        ).pipe(
            switchMap(() =>
                from(
                    this.foldingPositionsService.increaseSimplePosition(params),
                ),
            ),
        );
    }

    decreaseSimplePosition(
        params: IDecreaseSimplePosition,
    ): Observable<Object | IErrorMessageData> {
        return from(
            this.foldingPositionsService.decreaseSimplePosition(params),
        );
    }

    simulatePositionChange(
        position: IPosition,
        delta?: number,
        leverage?: number,
    ): Observable<IPositionDetails> {
        const principalValue = (position.principalValue || 0) + (delta || 0);
        const principalValueUsd =
            principalValue * position.supplyMarket.assetUsdValue;

        const newLeverage = leverage || position.leverage;

        const supplyAmount =
            (position.positionValue || principalValue) * (newLeverage + 1);
        const supplyAmountUsd =
            supplyAmount * position.supplyMarket.assetUsdValue;

        const foldingMarket = this.marketsService.findFoldingMarket(
            position.platformAddress,
            position.supplyTokenAddress,
            position.borrowTokenAddress,
        );

        return this.getBorrowAmountForPosition(
            position.platformAddress,
            position.supplyTokenAddress,
            principalValue,
            newLeverage,
            position.borrowTokenAddress,
        ).pipe(
            map(([borrowAmount, executionPrice]) => {
                const borrowAmountUsd =
                    borrowAmount * position.borrowMarket.assetUsdValue;

                const positionValueUsd = supplyAmountUsd - borrowAmountUsd;
                const positionValue =
                    positionValueUsd / position.supplyMarket.assetUsdValue;

                return {
                    principalValue,
                    principalValueUsd,
                    positionValue,
                    positionValueUsd,
                    pnl: position.pnl + position.rewardsPnl,
                    executionPrice,
                    supplyAmount,
                    supplyAmountUsd,
                    borrowAmount,
                    borrowAmountUsd,
                    borrowLimitUsage:
                        borrowAmountUsd /
                        (supplyAmountUsd *
                            position.supplyMarket.collateralFactor),
                    nativeApr:
                        (leverage * position.supplyMarket.supplyAPR -
                            leverage * position.borrowMarket.borrowAPR) *
                        100,
                    apr: position.apr,
                    distributionApr: position.supplyMarket.supplyAPR,
                    fodlApr: this.marketsService.getFodlApr(
                        foldingMarket.totalValue,
                        newLeverage,
                        isMarketSafe(
                            foldingMarket.supplyMarket.assetAddress.toLowerCase(),
                            foldingMarket.borrowAsset.asset.address.toLowerCase(),
                        ),
                    ),
                };
            }),
        );
    }

    getPositionDetails(position: IPosition): IPositionDetails {
        const foldingMarket = this.marketsService.findFoldingMarket(
            position.supplyMarket.platform.address,
            position.supplyMarket.assetAddress,
            position.borrowMarket.assetAddress,
        );

        return {
            principalValue: position.principalValue,
            principalValueUsd: position.principalValueUsd,
            positionValue: position.positionValue,
            positionValueUsd: position.positionValueUsd,
            pnl: position.pnl + position.rewardsPnl,
            executionPrice: 0,
            supplyAmount: position.supplyAmount,
            supplyAmountUsd: position.supplyAmountUsd,
            borrowAmount: position.borrowAmount,
            borrowAmountUsd: position.borrowAmountUsd,
            borrowLimitUsage:
                position.borrowAmountUsd /
                (position.supplyAmountUsd *
                    position.supplyMarket.collateralFactor),
            nativeApr:
                (position.leverage * position.supplyMarket.supplyAPR -
                    position.leverage * position.borrowMarket.borrowAPR) *
                100,
            apr: position.apr,
            distributionApr: position.supplyMarket.supplyAPR,
            fodlApr: this.marketsService.getFodlApr(
                foldingMarket.totalValue,
                position.leverage,
                isMarketSafe(
                    foldingMarket.supplyMarket.assetAddress.toLowerCase(),
                    foldingMarket.borrowAsset.asset.address.toLowerCase(),
                ),
            ),
        };
    }
}
