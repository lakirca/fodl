export class GeckoPriceServiceMock {
    async refreshERC20Prices(tokens: string[]): Promise<object> {
        return {};
    }

    async refreshETHPrice(): Promise<number> {
        return 1;
    }

    async getERC20Price(
        tokenAddress: string,
        refresh: boolean = false,
    ): Promise<number> {
        return 1;
    }

    async getETHPrice(refresh: boolean = false): Promise<number> {
        return 1;
    }

    async getPrice(
        tokenAddress: string,
        refresh: boolean = false,
    ): Promise<number> {
        return 1;
    }

    getLatestPrice(tokenAddress: string): number {
        return 1;
    }

    async getExchangeRate(token1: string, token2: string): Promise<number> {
        return 1;
    }
}
