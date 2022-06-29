import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { DEFAULT_NETWORK, NETWORKS } from '../../constants/blockchain';

import { ConfigurationService } from '../../services/configuration/configuration.service';
import { EthereumService } from '../../services/ethereum/ethereum.service';

@Component({
    selector: 'app-network-select',
    templateUrl: './network-select.component.html',
})
export class NetworkSelectComponent {
    networks = NETWORKS;
    network = DEFAULT_NETWORK;

    constructor(
        private configurationService: ConfigurationService,
        private ethereumService: EthereumService,
        private router: Router,
    ) {
        this.configurationService
            .getConfig('network')
            .subscribe((network) => (this.network = network));
    }

    changeNetwork(value: string) {
        this.network = value;

        this.configurationService.setConfig('network', this.network);

        this.ethereumService.switchChain(this.network);

        this.router.navigate(['/trading']);
    }
}
