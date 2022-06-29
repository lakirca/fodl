import { Injectable } from '@angular/core';

import { BehaviorSubject, combineLatest, from, Observable } from 'rxjs';
import { distinctUntilChanged, filter, first, tap } from 'rxjs/operators';

import {
    ASSET_BSCUSDC,
    ASSET_FODL,
    ASSET_USDC,
    BSC_PLATFORMS,
    DEFAULT_LEVERAGE_DIVIDER,
    ETH_DECIMALS,
    FODL_MAX_APR,
    MAX_LEVERAGE_MODIFIER,
    PLATFORMS,
    WETH_ADDRESS,
} from '../../constants/blockchain';

import { IFoldingMarket, IMarket } from '../../interfaces/market.interface';

import { getAssetPairs } from '../../utilities/assetPairs';
import { convertToBigNumber, parseBigNumber } from '../../utilities/big-number';
import { convertMarketAsset } from '../../utilities/convertMarketAsset';
import { getFodlPerWeek } from '../../utilities/fodlPerWeek';
import { isMarketSafe } from '../../utilities/marketSafe';
import { isStableCoin } from '../../utilities/stableCoin';
import { sumBigNumbers } from '../../utilities/sumBigNumbers';

import { ERC20Service } from '../erc20/erc20.service';
import { EthereumService } from '../ethereum/ethereum.service';
import { FoldingMarketsService } from '../folding/foldingMarkets/foldingMarkets.service';
import { GeckoPriceService } from '../gecko-price/gecko-price.service';
import { TvlService } from '../tvl/tvl.service';

@Injectable()
export class MarketsService {
    markets$: BehaviorSubject<IMarket[]> = new BehaviorSubject<IMarket[]>(
        undefined,
    );

    foldingMarkets$: BehaviorSubject<IFoldingMarket[]> = new BehaviorSubject<
        IFoldingMarket[]
    >(undefined);

    marketsLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        undefined,
    );

    private fodlPrice$: BehaviorSubject<number> = new BehaviorSubject<number>(
        undefined,
    );

    constructor(
        private erc20service: ERC20Service,
        private ethereumService: EthereumService,
        private foldingMarketsService: FoldingMarketsService,
        private geckoPriceService: GeckoPriceService,
        private tvlService: TvlService,
    ) {
        from(
            this.geckoPriceService.getERC20Price(ASSET_FODL.address, true),
        ).subscribe((fodlPrice) => this.fodlPrice$.next(fodlPrice));

        combineLatest([
            this.ethereumService.connected$.pipe(distinctUntilChanged()),
            this.ethereumService.account$.pipe(distinctUntilChanged()),
        ])
            .pipe(distinctUntilChanged())
            .subscribe(([connected, _]) => {
                if (connected) {
                    this.getMarkets();
                } else {
                    this.markets$.next(undefined);
                }
            });

        combineLatest([this.tvlService.tvl$, this.markets$, this.fodlPrice$])
            .pipe(
                distinctUntilChanged(),
                filter(
                    ([_, markets, fodlPrice]) =>
                        !!markets?.length && !!fodlPrice && fodlPrice > 0,
                ),
            )
            .subscribe(([tvl, markets]) => {
                const networkMarkets = getAssetPairs(
                    this.ethereumService.getNetwork(),
                )
                    .map((assetPair) => {
                        const supplyMarket = markets.find(
                            (market) =>
                                market.assetAddress.toLowerCase() ===
                                    assetPair.supplyAsset.address.toLowerCase() &&
                                market.platform.address.toLowerCase() ===
                                    assetPair.supplyAsset.platformAddress.toLowerCase(),
                        );

                        const borrowMarket = markets.find(
                            (market) =>
                                market.assetAddress.toLowerCase() ===
                                    assetPair.borrowAsset.address.toLowerCase() &&
                                market.platform.address.toLowerCase() ===
                                    assetPair.borrowAsset.platformAddress.toLowerCase(),
                        );

                        const maxLeverage = this.getMaxLeverage(
                            supplyMarket.collateralFactor,
                        );

                        const defaultLeverage =
                            maxLeverage / DEFAULT_LEVERAGE_DIVIDER;

                        const price = isStableCoin(supplyMarket.assetAddress)
                            ? parseBigNumber(
                                  borrowMarket.referencePrice
                                      .mul(convertToBigNumber(1))
                                      .div(supplyMarket.referencePrice),
                                  ETH_DECIMALS -
                                      (borrowMarket.assetDecimals -
                                          supplyMarket.assetDecimals),
                              )
                            : parseBigNumber(
                                  supplyMarket.referencePrice
                                      .mul(convertToBigNumber(1))
                                      .div(borrowMarket.referencePrice),
                                  ETH_DECIMALS -
                                      (supplyMarket.assetDecimals -
                                          borrowMarket.assetDecimals),
                              );

                        const liquidationPriceMovement =
                            price *
                            (1 +
                                1 /
                                    (supplyMarket.liquidationFactor *
                                        defaultLeverage) -
                                1 / supplyMarket.liquidationFactor);

                        const liquidationPrice = isStableCoin(
                            supplyMarket.assetAddress,
                        )
                            ? price + liquidationPriceMovement
                            : price - liquidationPriceMovement;

                        const marketApr = this.getMarketApr(
                            defaultLeverage,
                            supplyMarket,
                            borrowMarket,
                        );

                        const marketMaxApr = this.getMarketApr(
                            maxLeverage,
                            supplyMarket,
                            borrowMarket,
                        );

                        const marketDistributionApr =
                            this.getMarketDistributionApr(
                                defaultLeverage,
                                supplyMarket,
                                borrowMarket,
                            );

                        const marketMaxDistributionApr =
                            this.getMarketDistributionApr(
                                maxLeverage,
                                supplyMarket,
                                borrowMarket,
                            );

                        const positionType = tvl?.find(
                            (positionType) =>
                                positionType.supplyTokenAddress.toLowerCase() ===
                                    assetPair.supplyAsset.address.toLowerCase() &&
                                positionType.borrowTokenAddress.toLowerCase() ===
                                    assetPair.borrowAsset.address.toLowerCase() &&
                                positionType.platformAddress.toLowerCase() ===
                                    assetPair.supplyAsset.platformAddress.toLowerCase(),
                        );

                        const getTotalValuePerPlatforms = (platforms) =>
                            sumBigNumbers(
                                tvl
                                    .filter((tvl) =>
                                        platforms
                                            .map((platform) => platform.address)
                                            .includes(tvl.platformAddress),
                                    )
                                    .filter(
                                        (tvl) =>
                                            tvl.safe ===
                                            isMarketSafe(
                                                supplyMarket.assetAddress,
                                                borrowMarket.assetAddress,
                                            ),
                                    )
                                    .map((tvl) => tvl.totalValue),
                            );

                        const totalValue =
                            parseBigNumber(
                                getTotalValuePerPlatforms(PLATFORMS),
                                ASSET_USDC.decimals,
                            ) +
                            parseBigNumber(
                                getTotalValuePerPlatforms(BSC_PLATFORMS),
                                ASSET_BSCUSDC.decimals,
                            );

                        const apr = this.getFodlApr(
                            totalValue,
                            defaultLeverage,
                            isMarketSafe(
                                assetPair.supplyAsset.address,
                                assetPair.borrowAsset.address,
                            ),
                        );

                        const maxApr = this.getFodlApr(
                            totalValue,
                            maxLeverage,
                            isMarketSafe(
                                assetPair.supplyAsset.address,
                                assetPair.borrowAsset.address,
                            ),
                        );

                        return {
                            supplyMarket,
                            borrowAsset: convertMarketAsset(borrowMarket),
                            price,
                            liquidationPrice,
                            maxLeverage,
                            defaultLeverage,
                            total: positionType
                                ? parseBigNumber(
                                      positionType.totalValue,
                                      this.ethereumService.getNetworkSpecificUSDC()
                                          .decimals,
                                  )
                                : 0,
                            totalValue,
                            apr,
                            maxApr,
                            marketApr,
                            marketDistributionApr,
                            marketMaxApr,
                            marketMaxDistributionApr,
                        };
                    })
                    .filter((networkMarket) => networkMarket.maxLeverage > 1);

                this.foldingMarkets$.next(networkMarkets);
            });
    }

    getMarkets() {
        this.marketsLoading$.next(true);

        from(this.foldingMarketsService.getMarketData())
            .pipe(
                filter((markets) => !!markets?.length),
                first(),
            )
            .subscribe(async (markets) => {
                this.markets$.next(
                    await Promise.all(
                        markets.map(async (market) => ({
                            ...market,
                            walletBalance: this.ethereumService.getAccount()
                                ? parseBigNumber(
                                      await this.erc20service.getBalance(
                                          this.ethereumService.getAccount(),
                                          market.assetAddress
                                              ? market.assetAddress
                                              : WETH_ADDRESS,
                                      ),
                                      market.assetDecimals,
                                  )
                                : 0,
                        })),
                    ),
                );

                this.marketsLoading$.next(false);
            });
    }

    getMarketApr(
        leverage: number,
        supplyMarket: IMarket,
        borrowMarket: IMarket,
    ): number {
        return (
            ((leverage + 1) * supplyMarket.supplyAPR -
                leverage * borrowMarket.borrowAPR) *
            100
        );
    }

    getMarketDistributionApr(
        leverage: number,
        supplyMarket: IMarket,
        borrowMarket: IMarket,
    ): number {
        return (
            ((leverage + 1) * supplyMarket.supplyRewardsAPR -
                leverage * -borrowMarket.borrowRewardsAPR) *
            100
        );
    }

    getFodlApr(totalValue: number, leverage: number, safe: boolean): number {
        if (totalValue === 0) {
            return FODL_MAX_APR;
        } else {
            const fodlRewardsValue =
                getFodlPerWeek() *
                52 *
                this.fodlPrice$.getValue() *
                (safe ? 0.2 : 0.8);

            const fodlAPR =
                ((fodlRewardsValue * (leverage * 2 - 1)) / totalValue) * 100;
            return fodlAPR;
        }
    }

    findMarket(platform: string, asset: string): IMarket {
        const markets = this.markets$.getValue();

        return markets?.find(
            (market) =>
                market.platform.address.toLowerCase() ===
                    platform.toLowerCase() &&
                market.assetAddress.toLowerCase() === asset.toLowerCase(),
        );
    }

    findFoldingMarket(
        platform: string,
        supplyAsset: string,
        borrowAsset: string,
    ): IFoldingMarket {
        return (
            this.foldingMarkets$.getValue() &&
            this.foldingMarkets$
                .getValue()
                .find(
                    (foldingMarket) =>
                        foldingMarket.supplyMarket.platform.address.toLowerCase() ===
                            platform.toLowerCase() &&
                        foldingMarket.supplyMarket.assetAddress.toLowerCase() ===
                            supplyAsset.toLowerCase() &&
                        foldingMarket.borrowAsset.asset.address.toLowerCase() ===
                            borrowAsset.toLowerCase(),
                )
        );
    }

    getValueUSD(amount: number, address: string, platform: string): number {
        return this.findMarket(platform, address)?.assetUsdValue * amount;
    }

    getValueToken(amount: number, address: string, platform: string): number {
        return amount / this.findMarket(platform, address)?.assetUsdValue;
    }

    getAllowance(account: string, token: string): Observable<number> {
        return from(this.erc20service.getAllowance(account, token));
    }

    getMaxLeverage(collateralFactor: number): number {
        return parseFloat(
            (
                (collateralFactor / (1 - collateralFactor)) *
                MAX_LEVERAGE_MODIFIER
            ).toFixed(2),
        );
    }
}
