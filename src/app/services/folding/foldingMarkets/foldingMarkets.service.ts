import { Injectable } from '@angular/core';

import {
    LendingPlatformLens,
    LendingPlatformLens__factory,
} from '@0xb1/fodl-typechain';

import { IMarket } from '../../../interfaces/market.interface';

import {
    convertToBigNumber,
    parseBigNumber,
} from '../../../utilities/big-number';

import { GeckoPriceService } from '../../gecko-price/gecko-price.service';
import { EthereumService } from '../../ethereum/ethereum.service';

@Injectable()
export class FoldingMarketsService {
    lendingPlatformLens: LendingPlatformLens;

    constructor(
        private ethereumService: EthereumService,
        private geckoPriceService: GeckoPriceService,
    ) {}

    connect() {
        const lendingPlatformLens =
            this.ethereumService.getNetworkLendingLens();

        this.lendingPlatformLens = LendingPlatformLens__factory.connect(
            lendingPlatformLens,
            this.ethereumService.getBaseProvider(),
        );
    }

    async getMarketData(): Promise<IMarket[]> {
        this.connect();

        try {
            await this.geckoPriceService.refreshERC20Prices(
                this.ethereumService
                    .getNetworkAssets()
                    .map((asset) => asset.address),
                this.ethereumService.getNetwork(),
            );

            const network_platforms =
                this.ethereumService.getNetworkPlatforms();

            const platforms = network_platforms.map((platform) => ({
                address: platform.address,
                name: platform.name,
            }));

            const platformAssets = network_platforms.flatMap((platform) =>
                platform.assets.map((asset) => ({
                    asset: asset.address,
                    platform: platform.address,
                })),
            );

            const assetsMetadataWithoutUsdValues = (
                await this.lendingPlatformLens.callStatic.getAssetMetadata(
                    platformAssets.map(
                        (platformAsset) => platformAsset.platform,
                    ),
                    platformAssets.map((platformAsset) => platformAsset.asset),
                )
            ).map((assetMetadata, index) => ({
                ...assetMetadata,
                borrowAPRBigNumber: assetMetadata.borrowAPR,
                borrowAPR: parseBigNumber(assetMetadata.borrowAPR),
                borrowRewardsAPR:
                    (parseBigNumber(
                        assetMetadata.estimatedBorrowRewardsPerYear,
                        assetMetadata.rewardTokenDecimals,
                    ) *
                        this.geckoPriceService.getLatestPrice(
                            assetMetadata.rewardTokenAddress,
                        )) /
                    (parseBigNumber(
                        assetMetadata.totalBorrow,
                        assetMetadata.assetDecimals,
                    ) *
                        this.geckoPriceService.getLatestPrice(
                            assetMetadata.assetAddress,
                        )),
                collateralFactor: parseBigNumber(
                    assetMetadata.collateralFactor,
                ),
                collateralFactorBigNumber: assetMetadata.collateralFactor,
                liquidationFactor: parseBigNumber(
                    assetMetadata.liquidationFactor,
                ),
                supplyAPRBigNumber: assetMetadata.supplyAPR,
                supplyAPR: parseBigNumber(assetMetadata.supplyAPR),
                supplyRewardsAPR:
                    (parseBigNumber(
                        assetMetadata.estimatedSupplyRewardsPerYear,
                        assetMetadata.rewardTokenDecimals,
                    ) *
                        this.geckoPriceService.getLatestPrice(
                            assetMetadata.rewardTokenAddress,
                        )) /
                    (parseBigNumber(
                        assetMetadata.totalSupply,
                        assetMetadata.assetDecimals,
                    ) *
                        this.geckoPriceService.getLatestPrice(
                            assetMetadata.assetAddress,
                        )),
                totalBorrowBigNumber: assetMetadata.totalBorrow,
                totalBorrow: parseBigNumber(
                    assetMetadata.totalBorrow,
                    assetMetadata.assetDecimals,
                ),
                totalSupplyBigNumber: assetMetadata.totalSupply,
                totalSupply: parseBigNumber(
                    assetMetadata.totalSupply,
                    assetMetadata.assetDecimals,
                ),
                totalLiquidityBigNumber: assetMetadata.totalLiquidity,
                totalLiquidity: parseBigNumber(
                    assetMetadata.totalLiquidity,
                    assetMetadata.assetDecimals,
                ),
                platform: platforms.find(
                    (platform) =>
                        platform.address.toLowerCase() ===
                        platformAssets[index].platform.toLowerCase(),
                ),
            }));

            const findAssetMetadataWithoutUsdValue = (
                platform: string,
                asset: string,
            ) =>
                assetsMetadataWithoutUsdValues.find(
                    (assetMetadata) =>
                        assetMetadata.platform.address.toLowerCase() ===
                            platform.toLowerCase() &&
                        assetMetadata.assetAddress.toLowerCase() ===
                            asset.toLowerCase(),
                );

            const assetsMetadata = assetsMetadataWithoutUsdValues.map(
                (assetMetadata) => {
                    const usdc = findAssetMetadataWithoutUsdValue(
                        assetMetadata.platform.address,
                        this.ethereumService.getNetworkSpecificUSDC().address,
                    );

                    const assetUsdValueBigNumber = assetMetadata.referencePrice
                        .mul(convertToBigNumber(1))
                        .mul(convertToBigNumber(1, assetMetadata.assetDecimals))
                        .div(usdc.referencePrice)
                        .div(convertToBigNumber(1, usdc.assetDecimals));

                    const assetUsdValue = parseBigNumber(
                        assetUsdValueBigNumber,
                    );

                    return {
                        ...assetMetadata,
                        assetUsdValueBigNumber,
                        assetUsdValue,
                    };
                },
            );

            return assetsMetadata;
        } catch {
            return [];
        }
    }
}
