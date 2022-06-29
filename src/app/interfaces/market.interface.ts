import { ethers } from 'ethers';
import { IMarketAsset } from './marketAsset.interface';

import { IPlatform } from './platform.interface';

export interface IMarket {
    assetAddress: string;
    assetDecimals: number;
    assetSymbol: string;
    borrowAPR: number;
    borrowAPRBigNumber: ethers.BigNumber;
    borrowRewardsAPR: number;
    collateralFactor: number;
    collateralFactorBigNumber: ethers.BigNumber;
    liquidationFactor: number;
    platform: IPlatform;
    referencePrice: ethers.BigNumber;
    supplyAPR: number;
    supplyAPRBigNumber: ethers.BigNumber;
    supplyRewardsAPR: number;
    totalBorrow: number;
    totalBorrowBigNumber: ethers.BigNumber;
    totalSupply: number;
    totalSupplyBigNumber: ethers.BigNumber;
    assetUsdValue: number;
    assetUsdValueBigNumber: ethers.BigNumber;
    totalLiquidityBigNumber: ethers.BigNumber;
    totalLiquidity: number;
    walletBalance?: number;
}

export interface IFoldingMarket {
    total: number;
    totalValue: number;
    apr: number;
    maxApr: number;
    marketApr: number;
    marketMaxApr: number;
    marketDistributionApr: number;
    marketMaxDistributionApr: number;
    supplyMarket: IMarket;
    borrowAsset: IMarketAsset;
    maxLeverage: number;
    defaultLeverage: number;
    price: number;
    liquidationPrice: number;
}
