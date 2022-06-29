import { Component, OnInit } from '@angular/core';

import { ethers } from 'ethers';

import { ASSET_FODL } from '../../constants/blockchain';

import { parseBigNumber } from '../../utilities/big-number';

import { ERC20Service } from '../../services/erc20/erc20.service';
import { EthereumService } from '../../services/ethereum/ethereum.service';
import { SingleSidedStakingService } from '../../services/single-sided-staking/single-sided-staking.service';

@Component({
    selector: 'app-single-sided-staking',
    templateUrl: './single-sided-staking.component.html',
})
export class SingleSidedStakingComponent implements OnInit {
    balanceFodl: ethers.BigNumber;
    balanceXFodl: ethers.BigNumber;

    xFodlPrice = 0;
    xFodlTotalSupply = 0;
    tvlUsd = 0;
    fodlUsdValue = 0;
    apr = 0;

    constructor(
        private erc20service: ERC20Service,
        private ethereumService: EthereumService,
        private singleSidedStakingService: SingleSidedStakingService,
    ) {}

    async ngOnInit() {
        this.getBalances();

        this.xFodlTotalSupply =
            await this.singleSidedStakingService.getXFodlTotalSupply();
        this.tvlUsd = await this.singleSidedStakingService.getTvlUsd();
        this.fodlUsdValue =
            await this.singleSidedStakingService.getFodlUsdValue();

        this.apr = (((50000000 / 3) * this.fodlUsdValue) / this.tvlUsd) * 100;
    }

    async getBalances() {
        this.xFodlPrice = await this.singleSidedStakingService.getXFodlPrice();

        this.balanceFodl = await this.erc20service.getBalance(
            this.ethereumService.getAccount(),
            ASSET_FODL.address,
        );

        this.balanceXFodl = await this.erc20service.getBalance(
            this.ethereumService.getAccount(),
            this.singleSidedStakingService.getXFodlAddress(),
        );
    }

    getBalanceXFodl(): number {
        return this.balanceXFodl ? parseBigNumber(this.balanceXFodl) : 0;
    }

    getBalanceXFodlUsd(): number {
        return this.getBalanceXFodl() * this.fodlUsdValue * this.xFodlPrice;
    }
}
