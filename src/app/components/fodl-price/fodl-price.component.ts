import { Component, OnDestroy, OnInit } from '@angular/core';

import { REFRESH_INTERVAL } from '../../constants/commons';
import { ASSET_FODL } from '../../constants/blockchain';

import { GeckoPriceService } from '../../services/gecko-price/gecko-price.service';

@Component({
    selector: 'app-fodl-price',
    templateUrl: './fodl-price.component.html',
})
export class FodlPriceComponent implements OnInit, OnDestroy {
    fodlPrice: number;
    fodlPriceInterval: number;

    constructor(private geckoPriceService: GeckoPriceService) {}

    ngOnInit() {
        this.getFodlPrice();

        this.fodlPriceInterval = window.setInterval(
            () => this.getFodlPrice(),
            REFRESH_INTERVAL,
        );
    }

    ngOnDestroy() {
        window.clearInterval(this.fodlPriceInterval);
    }

    async getFodlPrice() {
        this.fodlPrice = await this.geckoPriceService.getERC20Price(
            ASSET_FODL.address,
            true,
        );
    }
}
