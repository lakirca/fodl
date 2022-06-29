import { BigNumberish } from '@ethersproject/bignumber';
import { BytesLike } from '@ethersproject/bytes';

export interface IMerkleRootClaim {
    merkleRoot: BytesLike;
    amountAvailable: BigNumberish;
    merkleProof: BytesLike[];
}
