import { IMarket } from '../interfaces/market.interface';
import { IMarketAsset } from '../interfaces/marketAsset.interface';

export const convertMarketAsset = (market: IMarket): IMarketAsset => ({
    asset: {
        name: market.assetSymbol,
        address: market.assetAddress,
        platformAddress: market.platform.address,
        platformName: market.platform.name,
    },
    apy: market.borrowAPR - market.borrowRewardsAPR,
    borrowAPR: market.borrowAPR,
    borrowDistributionAPR: market.borrowRewardsAPR,
});
