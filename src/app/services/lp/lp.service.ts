import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { ethers } from 'ethers';

import { sushiLPAbi } from '../../../abis/sushi';

import {
    ASSET_FODL,
    ASSET_SUSHI,
    ASSET_USDC,
    ETH_DECIMALS,
    LP_FODL_ETH,
    LP_FODL_USDC,
} from '../../constants/blockchain';

import { parseBigNumber } from '../../utilities/big-number';

import { EthereumService } from '../ethereum/ethereum.service';
import { GeckoPriceService } from '../gecko-price/gecko-price.service';
import { StakingService } from '../staking/staking.service';

@Injectable()
export class LPService {
    public lpFodlUsdc: ethers.Contract;
    public lpFodlEth: ethers.Contract;

    public connected$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        false,
    );

    private usdLiquidity24h = [];
    private usdVolume24h = [];
    public reserves = [];
    private ethPrice = 0;
    private fodlPrice = 0;

    constructor(
        private ethereumService: EthereumService,
        private geckoPriceService: GeckoPriceService,
        private stakingService: StakingService,
    ) {
        this.connect();
    }

    async connect() {
        this.lpFodlEth = new ethers.Contract(
            LP_FODL_ETH,
            sushiLPAbi,
            this.ethereumService.getEthereumProvider(),
        );

        this.lpFodlUsdc = new ethers.Contract(
            LP_FODL_USDC,
            sushiLPAbi,
            this.ethereumService.getEthereumProvider(),
        );

        this.fodlPrice = await this.geckoPriceService.getERC20Price(
            ASSET_FODL.address,
        );

        this.ethPrice = await this.geckoPriceService.getETHPrice();
    }

    getContractForLP(lp: string): ethers.Contract {
        switch (lp) {
            case LP_FODL_USDC:
                return this.lpFodlUsdc;
            case LP_FODL_ETH:
                return this.lpFodlEth;
        }

        return undefined;
    }

    getLPfromContract(contract: ethers.Contract): string {
        switch (contract.address) {
            case this.lpFodlUsdc.address:
                return LP_FODL_USDC;
            case this.lpFodlEth.address:
                return LP_FODL_ETH;
        }

        return undefined;
    }

    async getReserves(contract: ethers.Contract) {
        if (this.reserves[contract.address]) {
            return this.reserves[contract.address];
        } else {
            const reserves = await contract.callStatic.getReserves();

            this.reserves[contract.address] = reserves;

            return reserves;
        }
    }

    async totalSupply(contract: ethers.Contract) {
        return contract?.callStatic.totalSupply();
    }

    async balanceOf(contract: ethers.Contract, account: string) {
        return contract?.callStatic.balanceOf(account);
    }

    async getTvl(contract: ethers.Contract): Promise<number> {
        if (!(contract && this.reserves)) {
            return 0;
        }

        const lp = this.getLPfromContract(contract);

        const tokenPrice = lp === LP_FODL_ETH ? this.ethPrice : 1;

        const reserves = await this.getReserves(contract);

        const fodlAmount = parseBigNumber(reserves._reserve0);
        const tokenAmount = parseBigNumber(
            reserves._reserve1,
            lp === LP_FODL_USDC ? ASSET_USDC.decimals : ETH_DECIMALS,
        );

        return fodlAmount * this.fodlPrice + tokenAmount * tokenPrice;
    }

    async getApr(contract: ethers.Contract): Promise<number> {
        if (!contract) {
            return 0;
        }

        return this.usdVolume24h[contract.address] &&
            this.usdLiquidity24h[contract.address]
            ? (this.usdVolume24h[contract.address] /
                  this.usdLiquidity24h[contract.address]) *
                  100
            : 0;
    }

    async getFodlApr(contract: ethers.Contract): Promise<number> {
        if (!contract) {
            return 0;
        }

        const lp = this.getLPfromContract(contract);

        const totalSupply = parseBigNumber(
            await this.stakingService.totalSupply(
                this.stakingService.getContractForLP(lp),
            ),
        );

        const lpValue = await this.getTvl(contract);

        const lpSupply = parseBigNumber(await this.totalSupply(contract));

        const lpPrice = lpValue / lpSupply;

        const rewardRate =
            parseBigNumber(
                await this.stakingService.rewardRate(
                    this.stakingService.getContractForLP(lp),
                ),
            ) *
            3 *
            60 *
            60 *
            24 *
            365;

        return totalSupply
            ? ((rewardRate * this.fodlPrice) / (totalSupply * lpPrice)) * 100
            : 0;
    }

    async getSushiApr(contract: ethers.Contract): Promise<number> {
        if (!contract) {
            return 0;
        }

        const lp = this.getLPfromContract(contract);

        const totalSupply = parseBigNumber(
            await this.stakingService.totalSupply(
                this.stakingService.getContractForLP(lp),
            ),
        );

        const sushiPrice = await this.geckoPriceService.getERC20Price(
            ASSET_SUSHI.address,
        );

        const lpValue = await this.getTvl(contract);

        const lpSupply = parseBigNumber(await this.totalSupply(contract));

        const lpPrice = lpValue / lpSupply;

        const rewardRate = 500 * 365;

        return totalSupply
            ? ((rewardRate * sushiPrice) / (totalSupply * lpPrice)) * 100
            : 0;
    }
}
