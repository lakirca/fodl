import { Component, Input, OnInit } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';

import { from, Observable } from 'rxjs';
import { filter, first, map, switchMap, tap } from 'rxjs/operators';

import { DIALOG_SMALL } from '../../constants/commons';
import {
    ASSET_FODL,
    ASSET_USDC,
    ETH_ADDRESS,
    ETH_DECIMALS,
    LP_FODL_ETH,
    LP_FODL_USDC,
} from '../../constants/blockchain';

import { aprToApy } from '../../utilities/apy';
import { parseBigNumber } from '../../utilities/big-number';

import { ConfigurationService } from '../../services/configuration/configuration.service';
import { EthereumService } from '../../services/ethereum/ethereum.service';
import { GeckoPriceService } from '../../services/gecko-price/gecko-price.service';
import { LPService } from '../../services/lp/lp.service';
import { StakingService } from '../../services/staking/staking.service';
import { StakingDialogComponent } from '../staking-dialog/staking-dialog.component';

@Component({
    selector: 'app-lp-info',
    templateUrl: './lp-info.component.html',
})
export class LpInfoComponent implements OnInit {
    @Input() name: string;
    @Input() icon: string;
    @Input() lp: string;

    assetFodl = ASSET_FODL;

    allowStaking$: Observable<boolean>;

    fodl = 0;
    fodlPrice = 0;

    token = 0;
    tokenPrice = 0;

    totalStaked = 0;
    staked = 0;
    rewards = 0;
    fodlApr = 0;
    fodlApy = 0;

    tokenAddress = '';
    tokenName = '';
    lpUrl = '';

    constructor(
        private dialog: MatDialog,
        private configurationService: ConfigurationService,
        private ethereumService: EthereumService,
        private geckoPriceService: GeckoPriceService,
        private stakingService: StakingService,
        private lpService: LPService,
    ) {
        this.allowStaking$ = this.configurationService.config$.pipe(
            filter(
                (config) => !!config.fodlStakingUsdc && !!config.fodlStakingEth,
            ),
            switchMap(() => this.ethereumService.account$),
            map((account) => !!account),
        );
    }

    ngOnInit() {
        this.ethereumService.connected$
            .pipe(
                filter(() => this.ethereumService.isEthereumNetwork()),
                switchMap(() => this.stakingService.updated$),
            )
            .subscribe(() => this.reloadData());

        switch (this.lp) {
            case LP_FODL_ETH:
                this.tokenName = 'ETH';
                this.tokenAddress = ETH_ADDRESS;
                this.lpUrl =
                    'https://app.sushi.com/add/ETH/0x4C2e59D098DF7b6cBaE0848d66DE2f8A4889b9C3';

                break;

            case LP_FODL_USDC:
                this.tokenName = 'USDC';
                this.tokenAddress = ASSET_USDC.address;
                this.lpUrl =
                    'https://app.sushi.com/add/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48/0x4C2e59D098DF7b6cBaE0848d66DE2f8A4889b9C3';

                break;
        }
    }

    reloadData() {
        from(this.geckoPriceService.refreshETHPrice())
            .pipe(
                tap(
                    (ethPrice) =>
                        (this.tokenPrice =
                            this.lp === LP_FODL_ETH ? ethPrice : 1),
                ),
                switchMap(() =>
                    this.geckoPriceService.getERC20Price(
                        ASSET_FODL.address,
                        true,
                    ),
                ),
                tap((fodlPrice) => (this.fodlPrice = fodlPrice)),
                switchMap(() => this.lpService.connected$),
                switchMap(() =>
                    from(
                        this.lpService.getReserves(
                            this.lpService.getContractForLP(this.lp),
                        ),
                    ),
                ),
                tap((reserves) => {
                    this.fodl = parseBigNumber(reserves._reserve0);
                    this.token = parseBigNumber(
                        reserves._reserve1,
                        this.lp === LP_FODL_USDC
                            ? ASSET_USDC.decimals
                            : ETH_DECIMALS,
                    );
                }),
                switchMap(() => this.allowStaking$),
                filter((allowStaking) => !!allowStaking),
                switchMap(() => this.stakingService.connected$),
                switchMap(() =>
                    from(
                        this.stakingService.balanceOf(
                            this.stakingService.getContractForLP(this.lp),
                        ),
                    ),
                ),
                map((balanceOfBigNumber) => parseBigNumber(balanceOfBigNumber)),
                tap((balanceOf) => (this.staked = balanceOf)),
                switchMap(() =>
                    from(
                        this.stakingService.earned(
                            this.stakingService.getContractForLP(this.lp),
                        ),
                    ),
                ),
                map((earnedBigNumber) => parseBigNumber(earnedBigNumber)),
                tap((earned) => (this.rewards = earned)),
                switchMap(() =>
                    this.stakingService.totalSupply(
                        this.stakingService.getContractForLP(this.lp),
                    ),
                ),
                map((totalSupplyBigNumber) =>
                    parseBigNumber(totalSupplyBigNumber),
                ),
                tap((totalSupply) => (this.totalStaked = totalSupply)),
                switchMap(() =>
                    this.lpService.getFodlApr(
                        this.lpService.getContractForLP(this.lp),
                    ),
                ),
                tap((fodlApr) => {
                    this.fodlApr = fodlApr;
                    this.fodlApy = aprToApy(this.fodlApr);
                }),
                first(),
            )
            .subscribe();
    }

    openStaking() {
        this.dialog.open(StakingDialogComponent, {
            width: DIALOG_SMALL,
            data: {
                pair: this.name,
            },
        });
    }
}
