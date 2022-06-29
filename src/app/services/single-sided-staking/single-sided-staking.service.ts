import { Injectable } from '@angular/core';

import {
    FodlSingleSidedStaking,
    FodlSingleSidedStaking__factory,
    FodlToken,
    FodlToken__factory,
} from '@0xb1/fodl-typechain';

import { ethers } from 'ethers';

import { filter, map, switchMap, tap } from 'rxjs/operators';

import { erc20Abi } from '../../../abis/erc20';

import { ASSET_FODL } from '../../constants/blockchain';

import { convertToBigNumber, parseBigNumber } from '../../utilities/big-number';

import { ConfigurationService } from '../configuration/configuration.service';
import { EthereumService } from '../ethereum/ethereum.service';
import { GeckoPriceService } from '../gecko-price/gecko-price.service';

@Injectable()
export class SingleSidedStakingService {
    private singleSidedStakingEthereum: FodlSingleSidedStaking;
    private singleSidedStaking: FodlSingleSidedStaking;
    private fodlToken: FodlToken;

    constructor(
        private configurationService: ConfigurationService,
        private ethereumService: EthereumService,
        private geckoPriceService: GeckoPriceService,
    ) {
        this.configurationService.config$
            .pipe(
                map((config) => config.singleSidedStaking),
                filter((singleSidedStaking) => !!singleSidedStaking),
                tap(
                    (singleSidedStaking) =>
                        (this.singleSidedStakingEthereum =
                            FodlSingleSidedStaking__factory.connect(
                                singleSidedStaking,
                                this.ethereumService.getEthereumProvider(),
                            )),
                ),
                switchMap(() => this.ethereumService.connected$),
            )
            .subscribe(() => {
                this.singleSidedStaking =
                    FodlSingleSidedStaking__factory.connect(
                        this.singleSidedStakingEthereum.address,
                        this.ethereumService.getSigner(),
                    );

                this.fodlToken = FodlToken__factory.connect(
                    ASSET_FODL.address,
                    this.ethereumService.getSigner(),
                );
            });
    }

    getXFodlAddress(): string {
        return this.singleSidedStaking.address;
    }

    getUnstakedAmount(amount: ethers.BigNumber): Promise<ethers.BigNumber> {
        return this.singleSidedStaking.callStatic.unstake(amount);
    }

    async getStakingAPR(): Promise<number> {
        return 0;
    }

    async getXFodlPrice(): Promise<number> {
        const totalSupply =
            await this.singleSidedStakingEthereum.callStatic.totalSupply();

        const balance = convertToBigNumber(await this.getFodlTvl());

        return totalSupply.isZero() || balance.isZero()
            ? 1
            : parseBigNumber(
                  balance.mul(convertToBigNumber(1)).div(totalSupply),
              );
    }
    async stake(amount: ethers.BigNumber) {
        try {
            return this.fodlToken.transferAndCall(
                this.singleSidedStaking.address,
                amount,
                '0x',
            );
        } catch (e) {
            return e;
        }
    }

    async unstake(amount: ethers.BigNumber) {
        try {
            return this.singleSidedStaking.unstake(amount);
        } catch (e) {
            return e;
        }
    }

    async getFodlUsdValue(): Promise<number> {
        return await this.geckoPriceService.getERC20Price(ASSET_FODL.address);
    }

    async getFodlTvl(): Promise<number> {
        return this.singleSidedStakingEthereum
            ? parseBigNumber(
                  await new ethers.Contract(
                      ASSET_FODL.address,
                      erc20Abi,
                      this.ethereumService.getEthereumProvider(),
                  ).callStatic.balanceOf(
                      this.singleSidedStakingEthereum.address,
                  ),
              )
            : 0;
    }

    async getXFodlTotalSupply(): Promise<number> {
        return parseBigNumber(
            await this.singleSidedStakingEthereum.callStatic.totalSupply(),
        );
    }

    async getTvlUsd(): Promise<number> {
        return (await this.getFodlUsdValue()) * (await this.getFodlTvl());
    }
}
