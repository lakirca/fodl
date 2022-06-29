import { IAsset } from './asset.interface';

export interface IMarketAsset {
    asset: IAsset;
    apy: number;
    borrowAPR: number;
    borrowDistributionAPR: number;
}
