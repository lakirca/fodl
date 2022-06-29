import { Injectable } from '@angular/core';

import { Observable, BehaviorSubject } from 'rxjs';

import { REFRESH_INTERVAL } from '../../constants/commons';
import {
    ASSET_AAVE,
    ASSET_STKAAVE,
    ETH_ADDRESS,
    WETH_ADDRESS,
} from '../../constants/blockchain';

import { waitFor } from '../../utilities/sleep';
import { isTheSameAsset } from '../../utilities/asset';

export const COINGECKO_API = 'https://api.coingecko.com/api/v3';

const REFRESH_CACHE = REFRESH_INTERVAL;

@Injectable()
export class GeckoPriceService {
    erc20Prices = new Map<string, { rate: number; refreshed: number }>();
    chartPrices = [];
    coinPrices = [];
    ethPrice = -1;
    ethRefreshed = 0;

    pricesRefreshing = false;

    errorSubject$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
    error$: Observable<string> = this.errorSubject$.asObservable();

    async refreshERC20Prices(
        tokens: string[],
        network = 'ethereum',
    ): Promise<any> {
        tokens = tokens
            .map((t) => t.toLowerCase())
            // HACK: treat stkAave as Aave for price checking
            .map((t) =>
                t === ASSET_STKAAVE.address.toLowerCase()
                    ? ASSET_AAVE.address.toLowerCase()
                    : t,
            );

        if (tokens.length) {
            const tokenString = tokens.join(',');

            this.pricesRefreshing = true;

            let networkId;

            switch (network) {
                case 'bsc':
                    networkId = 'binance-smart-chain';
                    break;

                case 'polygon':
                    networkId = 'polygon-pos';
                    break;

                default:
                    networkId = network;
            }

            await fetch(
                `${COINGECKO_API}/simple/token_price/${networkId}?contract_addresses=${tokenString}&vs_currencies=usd`,
            )
                .then((response) => response.json())
                .then((json) => {
                    tokens.forEach((addr) => {
                        if (
                            json[addr] !== undefined &&
                            json[addr].usd !== undefined
                        ) {
                            this.erc20Prices.set(addr, {
                                rate: json[addr].usd,
                                refreshed: new Date().getTime(),
                            });
                        } else {
                            this.erc20Prices.set(addr, {
                                rate: undefined,
                                refreshed: new Date().getTime(),
                            });
                        }
                    });
                })
                .catch((err) => {
                    console.error(`ERROR: fetching price for ${tokenString}`);
                    console.error(err);

                    this.errorSubject$.next(
                        `ERROR: fetching price for ${tokenString}`,
                    );

                    return {};
                });

            this.pricesRefreshing = false;

            await waitFor(!this.pricesRefreshing);

            await this.getETHPrice(true);

            return this.erc20Prices;
        }
    }

    async refreshETHPrice(): Promise<number> {
        await fetch(
            `${COINGECKO_API}/simple/price?ids=ethereum&vs_currencies=usd`,
        )
            .then((response) => response.json())
            .then((json) => (this.ethPrice = json.ethereum.usd));

        this.ethRefreshed = new Date().getTime();

        return this.ethPrice;
    }

    async getERC20Price(
        tokenAddress: string,
        refresh: boolean = false,
    ): Promise<number> {
        tokenAddress = tokenAddress.toLowerCase();

        if (
            !this.erc20Prices.has(tokenAddress) ||
            (this.erc20Prices.get(tokenAddress)['refreshed'] <
                new Date().getTime() - REFRESH_CACHE &&
                refresh)
        ) {
            await waitFor(!this.pricesRefreshing);

            await this.refreshERC20Prices([tokenAddress]);
        }

        return this.getLatestPrice(tokenAddress);
    }

    async getETHPrice(refresh: boolean = false): Promise<number> {
        if (
            this.ethPrice === undefined ||
            (this.ethRefreshed < new Date().getTime() - REFRESH_CACHE &&
                refresh)
        ) {
            await waitFor(!this.pricesRefreshing);

            return this.refreshETHPrice();
        }

        return this.ethPrice;
    }

    async getPrice(
        tokenAddress: string,
        refresh: boolean = false,
    ): Promise<number> {
        console.log('getting price:', tokenAddress);

        return tokenAddress === ETH_ADDRESS || tokenAddress === WETH_ADDRESS
            ? await this.getETHPrice(refresh)
            : await this.getERC20Price(tokenAddress, refresh);
    }

    getLatestPrice(asset: string): number {
        return asset === ETH_ADDRESS || asset === WETH_ADDRESS
            ? this.ethPrice
            : this.erc20Prices.get(
                  // HACK: treat stkAave as Aave for price checking
                  asset.toLowerCase() === ASSET_STKAAVE.address.toLowerCase()
                      ? ASSET_AAVE.address.toLowerCase()
                      : asset.toLowerCase(),
              )['rate'];
    }

    async getExchangeRate(fromAsset: string, toAsset: string): Promise<number> {
        return isTheSameAsset(fromAsset, toAsset)
            ? 1
            : (await this.getPrice(fromAsset, true)) /
                  (await this.getPrice(toAsset, true));
    }

    // Chart
    async getMarketChart(
        id: string,
        days = '30',
        currency = 'usd',
        interval = 'minutely',
    ): Promise<any> {
        const chartId = [id, currency, days, interval].join();

        if (this.chartPrices[chartId]) {
            return this.chartPrices[chartId];
        } else {
            this.chartPrices[chartId] = await fetch(
                `${COINGECKO_API}/coins/${id}/market_chart?vs_currency=${currency}&days=${days}&interval=${interval}`,
            )
                .then((response) => response.json())
                .then((json) => json.prices)
                .catch((err) => {
                    console.error(err);

                    this.errorSubject$.next(err);

                    return err;
                });

            return this.chartPrices[chartId];
        }
    }

    async getCoin(id: string): Promise<any> {
        if (this.coinPrices[id]) {
            return this.coinPrices[id];
        } else {
            this.coinPrices[id] = await fetch(
                `${COINGECKO_API}/coins/${id}?tickers=true&community_data=false&developer_data=false`,
            )
                .then((response) => response.json())
                .catch((err) => {
                    console.error(err);

                    this.errorSubject$.next(err);
                    return {};
                });

            return this.coinPrices[id];
        }
    }
}
