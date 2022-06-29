import { Component, Input } from '@angular/core';

import { ASSET_FODL } from '../../constants/blockchain';

@Component({
    selector: 'app-icon-asset',
    templateUrl: './icon-asset.component.html',
    styleUrls: ['./icon-asset.component.scss'],
})
export class IconAssetComponent {
    @Input() asset: string;
    @Input() assetName: string;
    @Input() platform?: string;
    @Input() platformName?: string;

    getAssetIconAddress(): string {
        return this.asset
            ? `/assets/icons/${this.asset.toLowerCase()}.${
                  this.asset.toLowerCase() === ASSET_FODL.address.toLowerCase()
                      ? 'svg'
                      : 'webp'
              }`
            : '';
    }
}
