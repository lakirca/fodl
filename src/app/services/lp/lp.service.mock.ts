import { ethers } from 'ethers';

import { BehaviorSubject } from 'rxjs';

import { convertToBigNumber } from '../../utilities/big-number';

export class LPServiceMock {
    public lpFodlEth: ethers.Contract;
    public lpFodlUsdc: ethers.Contract;

    public connected$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        false,
    );

    getContractForLP(lp: string) {}

    async connect() {}

    async getReserves(contract: ethers.Contract) {
        return {
            _reserve0: convertToBigNumber(0),
            _reserve1: convertToBigNumber(0),
        };
    }

    async getApr(contract: ethers.Contract) {
        return 0;
    }

    async getFodlApr(contract: ethers.Contract) {
        return 0;
    }

    async getSushiApr(contract: ethers.Contract) {
        return 0;
    }

    async getTvl(contract: ethers.Contract) {
        return 0;
    }
}
