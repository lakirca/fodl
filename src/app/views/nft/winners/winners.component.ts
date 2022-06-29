import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { from } from 'rxjs';
import { filter, first, switchMap } from 'rxjs/operators';

import { DIALOG_MEDIUM } from '../../../constants/commons';

import { TransactionComponent } from '../../../components/transaction/transaction.component';

import { EthereumService } from '../../../services/ethereum/ethereum.service';
import { NftService } from '../../../services/nft/nft.service';

@Component({
    selector: 'app-winners',
    templateUrl: './winners.component.html',
})
export class WinnersComponent implements OnInit {
    winners = [];

    constructor(
        private dialog: MatDialog,
        private ethereumService: EthereumService,
        private nftService: NftService,
    ) {}

    ngOnInit() {
        this.ethereumService.connected$
            .pipe(
                filter((connected) => !!connected),
                first(),
                switchMap(() => this.nftService.getWinners()),
            )
            .subscribe((winners) => (this.winners = winners));
    }

    isConnectedUserWinner(winner): boolean {
        return (
            this.ethereumService.getAccount() &&
            winner.address?.toLowerCase() ===
                this.ethereumService.getAccount()?.toLowerCase()
        );
    }

    claimNFT(winner) {
        this.nftService.claimNFT(winner.award.id);

        this.dialog.open(TransactionComponent, {
            width: DIALOG_MEDIUM,
            data: {
                title: 'Claim NFT Award',
                actionDescription: `Please sign a transaction to claim NFT award.`,
                callback: () => {},
                action: from(this.nftService.claimNFT(winner.award.id)),
            },
        });
    }
}
