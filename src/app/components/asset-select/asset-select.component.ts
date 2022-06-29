import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
} from '@angular/core';

import { IMarket } from '../../interfaces/market.interface';
import { IAsset } from '../../interfaces/asset.interface';
import { convertMarketAsset } from 'src/app/utilities/convertMarketAsset';

@Component({
    selector: 'app-asset-select',
    templateUrl: './asset-select.component.html',
})
export class AssetSelectComponent implements OnChanges {
    @Input() markets: IMarket[];
    @Input() assets?: IAsset[];
    @Input() asset: IAsset;

    @Output() assetChange: EventEmitter<IAsset> = new EventEmitter<IAsset>(
        undefined,
    );

    ngOnChanges(changes: SimpleChanges) {
        if (changes.markets) {
            this.assets = changes.markets.currentValue?.map(
                (market) => convertMarketAsset(market).asset,
            );
        }
    }

    findAsset(platformAsset: string): IAsset {
        return this.assets.find(
            (asset) =>
                (asset.platformAddress + asset.address).toLowerCase() ===
                platformAsset.toLowerCase(),
        );
    }

    getWalletBalance(asset: string): number {
        return this.markets.find((market) => market.assetAddress === asset)
            ?.walletBalance;
    }
}
