import { ethers } from 'ethers';
import { BytesLike } from '@ethersproject/bytes';

import { IMerkleRootClaim } from '../../../interfaces/claim.interface';
import { IRewardsResponse } from '../../../interfaces/rewards.interface';

export class FoldingRewardsServiceMock {
    connect() {}

    async claim(
        amount: ethers.BigNumber,
        claims: IMerkleRootClaim[],
        simulate?: boolean,
    ): Promise<string | Object> {
        return {};
    }

    async getStartTime(merkleRoot: BytesLike): Promise<ethers.BigNumber> {
        return undefined;
    }

    async getClaimedAmount(
        account: string,
        merkleRoot: BytesLike,
    ): Promise<ethers.BigNumber> {
        return undefined;
    }

    async getRewards(account: string): Promise<IRewardsResponse> {
        return undefined;
    }
}
