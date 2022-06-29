import { Component, Input } from '@angular/core';

import { IMarket } from '../../interfaces/market.interface';
import { IMarketAsset } from '../../interfaces/marketAsset.interface';

import { FoldingService } from '../../services/folding/folding.service';

@Component({
    selector: 'app-enter-position',
    templateUrl: './enter-position.component.html',
})
export class EnterPositionComponent {
    @Input() supplyMarket?: IMarket;
    @Input() leverage?: number;
    @Input() borrowAsset: IMarketAsset;

    constructor(public foldingService: FoldingService) {}
}
