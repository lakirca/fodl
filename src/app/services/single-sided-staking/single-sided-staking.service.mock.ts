import { FodlToken } from '@0xb1/fodl-typechain';

import { ethers } from 'ethers';

export class SingleSidedStakingServiceMock {
    xFodl: ethers.Contract;
    fodlToken: FodlToken;

    constructor() {}

    stake(amount: ethers.BigNumber): Promise<any> {
        return undefined;
    }

    getUnstakedAmount(): Promise<ethers.BigNumber> {
        return undefined;
    }

    getXFodlAddress(): string {
        return '';
    }

    async getStakingAPR(): Promise<number> {
        return 0;
    }

    async getXFodlPrice(): Promise<number> {
        return 1;
    }

    async getFodlUsdValue(): Promise<number> {
        return 0;
    }

    async getTvl(): Promise<number> {
        return 0;
    }

    async getTvlUsd(): Promise<number> {
        return 0;
    }

    unstake(amount: ethers.BigNumber): Promise<any> {
        return undefined;
    }
}
