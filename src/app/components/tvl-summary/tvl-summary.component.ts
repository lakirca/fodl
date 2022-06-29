import { Component } from '@angular/core';

import { Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

import { ITvlByPlatform } from '../../interfaces/tvl.interface';

import { LPs } from '../../constants/blockchain';

import { EthereumService } from '../../services/ethereum/ethereum.service';
import { LPService } from '../../services/lp/lp.service';
import { SingleSidedStakingService } from '../../services/single-sided-staking/single-sided-staking.service';
import { TvlService } from '../../services/tvl/tvl.service';

@Component({
    selector: 'app-tvl-summary',
    templateUrl: './tvl-summary.component.html',
})
export class TvlSummaryComponent {
    tvl: ITvlByPlatform[];
    error$: Observable<string>;

    lps = [];
    stakingTvl = 0;

    constructor(
        private ethereumService: EthereumService,
        private lpService: LPService,
        private singleSidedStakingService: SingleSidedStakingService,
        private tvlService: TvlService,
    ) {
        this.tvlService.getTvlByPlatform().subscribe((tvl) => (this.tvl = tvl));

        this.ethereumService.connected$
            .pipe(
                filter((connected) => !!connected),
                switchMap(() => this.lpService.connected$),
            )
            .subscribe(async () => {
                this.lps = await Promise.all(
                    LPs.map(async (lp) => ({
                        lp,
                        tvl: await this.lpService.getTvl(
                            this.lpService.getContractForLP(lp.lp),
                        ),
                    })),
                );

                this.stakingTvl =
                    await this.singleSidedStakingService.getTvlUsd();
            });
    }

    getLpTvlAggregated(): number {
        return this.lps.reduce((a, c) => (a += c.tvl), 0);
    }

    getPlatformTvlAggregated(): number {
        return this.tvl.reduce((a, c) => (a += c.total), 0);
    }

    getTotalTvl(): number {
        return this.tvl
            ? (this.getLpTvlAggregated() +
                  this.getPlatformTvlAggregated() +
                  this.stakingTvl) /
                  1000000
            : 0;
    }
}
