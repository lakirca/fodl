import { Injectable } from '@angular/core';

import { Contract } from 'ethers';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { erc721Abi } from '../../../abis/erc721';

import { ISnapshotResponse } from '../../interfaces/snapshot.interface';
import { INFTAward } from '../../interfaces/nftAward.interface';
import { INFTWinner } from '../../interfaces/nftWinner.interface';

import { BAKC_AWARDS, BAKC_IMG_ROOT, BAYC } from '../../constants/bakc';
import { NFT_BAKC_ADDRESS } from '../../constants/blockchain';

import { ApiService } from '../api/api.service';
import { EthereumService } from '../ethereum/ethereum.service';

@Injectable()
export class NftService {
    constructor(
        private apiService: ApiService,
        private ethereumService: EthereumService,
    ) {}

    getAwardUrl(id: number | string): string {
        return id === 'bayc'
            ? `${BAKC_IMG_ROOT}/bayc.jpg`
            : `${BAKC_IMG_ROOT}/${id}.jpg`;
    }

    getBakcAwardsList(): INFTAward[] {
        return [
            ...BAKC_AWARDS.map((award) => ({
                ...award,
                url: this.getAwardUrl(award.id),
                pool: 'BAKC',
            })),
        ];
    }

    getBaycAward(): INFTAward {
        return {
            ...BAYC,
            url: this.getAwardUrl('bayc'),
            pool: 'BAYC',
        };
    }

    getSnapshot(): Observable<ISnapshotResponse> {
        return this.apiService.get<ISnapshotResponse>('snapshot');
    }

    getWinners(): Observable<INFTWinner[]> {
        return this.apiService.get('nftGiveawayWinners').pipe(
            map((nftGiveawayWinners) =>
                [...this.getBakcAwardsList(), this.getBaycAward()].map(
                    (award) => ({
                        award,
                        address: Object.entries(nftGiveawayWinners)
                            .find(([_, id]) => award?.id === (id as number))
                            ?.reverse()
                            .pop(),
                    }),
                ),
            ),
        );
    }

    async claimNFT(id: number) {
        const bakc = new Contract(
            NFT_BAKC_ADDRESS,
            erc721Abi,
            this.ethereumService.getSigner(),
        );

        return bakc.transferFrom(
            await bakc.callStatic.ownerOf(id),
            await this.ethereumService.getSigner().getAddress(),
            id,
        );
    }
}
