import { Component, OnInit } from '@angular/core';

import { NftService } from '../../../services/nft/nft.service';

@Component({
    selector: 'app-awards',
    templateUrl: './awards.component.html',
})
export class AwardsComponent implements OnInit {
    awards = [];
    bayc = undefined;

    constructor(private nftService: NftService) {}

    ngOnInit() {
        this.awards = this.nftService.getBakcAwardsList();
        this.bayc = this.nftService.getBaycAward();
    }
}
