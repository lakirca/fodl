import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { ethers } from 'ethers';
import { BytesLike } from '@ethersproject/bytes';

import {
    RewardsDistributor,
    RewardsDistributor__factory,
} from '@0xb1/fodl-typechain';

import { IMerkleRootClaim } from '../../../interfaces/claim.interface';
import { IRewardsResponse } from '../../../interfaces/rewards.interface';

import { ApiService } from '../../api/api.service';
import { EthereumService } from '../../ethereum/ethereum.service';

@Injectable()
export class FoldingRewardsService {
    rewardsDistributor: RewardsDistributor;

    constructor(
        private apiService: ApiService,
        private ethereumService: EthereumService,
    ) {}

    connect() {
        const rewardsDistributor =
            this.ethereumService.getNetworkFoldingRewardsDistributor();

        this.rewardsDistributor = RewardsDistributor__factory.connect(
            rewardsDistributor,
            this.ethereumService.getSigner(),
        );
    }

    async claim(
        amount: ethers.BigNumber,
        claims: IMerkleRootClaim[],
        simulate?: boolean,
    ): Promise<
        [ethers.BigNumber, ethers.BigNumber] | ethers.ContractTransaction
    > {
        this.connect();

        if (simulate) {
            return this.rewardsDistributor.callStatic.claim(amount, claims);
        } else {
            try {
                return await this.rewardsDistributor.claim(amount, claims);
            } catch (e) {
                return e;
            }
        }
    }

    async getSchedule(
        merkleRoot: BytesLike,
    ): Promise<[ethers.BigNumber, ethers.BigNumber]> {
        this.connect();

        try {
            return this.rewardsDistributor.callStatic.schedule(merkleRoot);
        } catch {
            return [ethers.BigNumber.from(0), ethers.BigNumber.from(0)];
        }
    }

    async getClaimedAmount(
        account: string,
        merkleRoot: BytesLike,
    ): Promise<ethers.BigNumber> {
        this.connect();

        try {
            return this.rewardsDistributor.callStatic.userClaims(
                account,
                merkleRoot,
            );
        } catch {
            return undefined;
        }
    }

    getRewards(account: string): Observable<IRewardsResponse> {
        this.connect();

        switch (this.ethereumService.getNetwork()) {
            case 'bsc':
                return this.apiService.getBsc<IRewardsResponse>(
                    `rewards/${account}`,
                );

            case 'polygon':
                return this.apiService.getPolygon<IRewardsResponse>(
                    `rewards/${account}`,
                );

            default:
                return this.apiService.get<IRewardsResponse>(
                    `rewards/${account}`,
                );
        }
    }
}
