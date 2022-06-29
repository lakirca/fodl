import { Component } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigurationService } from '../../services/configuration/configuration.service';

import { LPs } from '../../constants/blockchain';

import { EthereumService } from '../../services/ethereum/ethereum.service';

@Component({
    selector: 'app-staking',
    templateUrl: './staking.component.html',
})
export class StakingComponent {
    lps = LPs;

    error$: Observable<string>;

    singleSidedStaking: boolean;

    constructor(
        private configurationService: ConfigurationService,
        public ethereumService: EthereumService,
    ) {
        this.error$ = this.ethereumService.connectedSubject$.pipe(
            map((value) =>
                !value ? 'Cannot connect to Ethereum blockchain.' : undefined,
            ),
        );

        this.configurationService.config$.subscribe(
            (config) => (this.singleSidedStaking = !!config.singleSidedStaking),
        );
    }
}
