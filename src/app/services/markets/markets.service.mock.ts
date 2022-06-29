import { BehaviorSubject } from 'rxjs';

import { IFoldingMarket, IMarket } from '../../interfaces/market.interface';

export class MarketsServiceMock {
    markets$: BehaviorSubject<IMarket[]> = new BehaviorSubject<IMarket[]>(
        undefined,
    );

    foldingMarkets$: BehaviorSubject<IFoldingMarket[]> = new BehaviorSubject<
        IFoldingMarket[]
    >(undefined);

    marketsLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        true,
    );

    getMarkets() {}

    getFodlApr(totalValue: number, leverage: number) {}

    findMarket(platform: string, asset: string) {}

    findFoldingMarket(
        platform: string,
        supplyAsset: string,
        borrowAsset: string,
    ) {}

    getValueUSD(amount: number, address: string, platform: string) {}

    getValueToken(amount: number, address: string, platform: string) {}

    getAllowance(account: string, token: string) {}

    getMaxLeverage(collateralFactor?: number) {}
}
