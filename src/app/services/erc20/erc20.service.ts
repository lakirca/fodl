import { ethers } from 'ethers';

import { Injectable } from '@angular/core';

import {
    ETH_ADDRESS,
    ETH_DECIMALS,
    WETH_ADDRESS,
} from '../../constants/blockchain';

import { erc20Abi } from '../../../abis/erc20';

import { IErrorMessageData } from '../../interfaces/errorMessageData.interface';

import { EthereumService } from '../ethereum/ethereum.service';
import { convertToBigNumber } from '../../utilities/big-number';

@Injectable()
export class ERC20Service {
    private erc20contracts: {
        [tokenAddress: string]: ethers.Contract;
    } = {};

    private erc20signerContracts: {
        [tokenAddress: string]: ethers.Contract;
    } = {};

    constructor(private ethereumService: EthereumService) {}

    getContract(tokenAddress: string): ethers.Contract {
        if (!this.erc20contracts[tokenAddress]) {
            this.erc20contracts[tokenAddress] = new ethers.Contract(
                tokenAddress,
                erc20Abi,
                this.ethereumService.getBaseProvider(),
            );
        }

        return this.erc20contracts[tokenAddress];
    }

    getSignerContract(tokenAddress: string): ethers.Contract {
        if (!this.erc20signerContracts[tokenAddress]) {
            this.erc20signerContracts[tokenAddress] = new ethers.Contract(
                tokenAddress,
                erc20Abi,
                this.ethereumService.getSigner(),
            );
        }

        return this.erc20signerContracts[tokenAddress];
    }

    async getDecimals(tokenAddress: string): Promise<number> {
        return tokenAddress === ETH_ADDRESS || tokenAddress === WETH_ADDRESS
            ? ETH_DECIMALS
            : await this.getContract(tokenAddress).decimals();
    }

    async getTokenAmount(
        tokenAddress: string,
        amount: ethers.BigNumber,
    ): Promise<number> {
        return parseFloat(
            ethers.utils.formatUnits(
                amount,
                await this.getDecimals(tokenAddress),
            ),
        );
    }

    async getBalance(walletAddress, tokenAddress): Promise<ethers.BigNumber> {
        return this.getSignerContract(tokenAddress)?.callStatic.balanceOf(
            walletAddress,
        );
    }

    async getAllowance(walletAddress, tokenAddress): Promise<number> {
        const contract = this.getSignerContract(tokenAddress);

        try {
            return parseFloat(
                ethers.utils.formatUnits(
                    await contract.allowance(
                        await this.ethereumService.getSigner().getAddress(),
                        walletAddress,
                    ),
                    await contract.decimals(),
                ),
            );
        } catch {
            return 0;
        }
    }

    async approveAllowance(
        accountAddress: string,
        tokenAddress: string,
        amount?: number,
    ): Promise<Object | IErrorMessageData> {
        const contract = this.getSignerContract(tokenAddress);

        try {
            return await contract.approve(
                accountAddress,
                amount
                    ? convertToBigNumber(
                          amount,
                          await contract.callStatic.decimals(),
                      )
                    : ethers.constants.MaxUint256,
            );
        } catch (e) {
            return e;
        }
    }
}
