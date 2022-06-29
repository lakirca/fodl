import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { NftService } from '../../services/nft/nft.service';

@Component({
    selector: 'app-nft',
    templateUrl: './nft.component.html',
})
export class NftComponent implements OnInit {
    tickets = 0;

    leaderboard = [];
    snapshotDate;

    constructor(private nftService: NftService) {}

    ngOnInit(): void {
        this.nftService
            .getSnapshot()
            .pipe(first())
            .subscribe((snapshot) => {
                this.snapshotDate = new Date(snapshot.currSnapshot.timestamp);
                this.tickets = Object.values(
                    snapshot.currSnapshot.allocation,
                ).reduce((a, c) => (a += c.total), 0);

                this.leaderboard = Object.entries(
                    snapshot.currSnapshot.allocation,
                )
                    .map(([address, entry]) => ({
                        address,
                        ...entry,
                        percent: (entry.total / this.tickets) * 100,
                        change:
                            entry.total -
                            (snapshot.prevSnapshot.allocation[address]?.total ||
                                0),
                    }))
                    .sort((a, b) => b.total - a.total)
                    .map((entry, index) => ({
                        ...entry,
                        rank: index + 1,
                    }));
            });
    }
}
