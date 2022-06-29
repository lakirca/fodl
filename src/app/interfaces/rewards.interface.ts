import { ethers } from 'ethers';

export interface IRewardsPerMerkleRoot {
    merkleRoot: string;
    accountOwner: string;
    amount: string;
    merkleProof: ethers.BytesLike[];
    block: number;
}

export type IRewardsResponse = IRewardsPerMerkleRoot[];
