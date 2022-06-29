import { ASSET_DAI, ASSET_WETH, PLATFORM_COMPOUND } from './assets';

export * from './assets';

export const NETWORKS = [
    {
        name: 'ethereum',
        description: 'Ethereum',
    },
    {
        name: 'bsc',
        description: 'Binance (Beta)',
    },
    {
        name: 'polygon',
        description: 'Polygon (Beta)',
    },
];

export const DEFAULT_NETWORK = 'ethereum';

export const DEFAULT_MARKET_ASSUMPTION = 10;

export const MIN_REWARDS = 0.00001;

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const DEFAULT_ROUNDING = 8;

export const GAS_LIMIT = undefined;
export const GAS_MULTIPLIER = 1.5;
export const MAX_LEVERAGE_MODIFIER = 0.9;
export const DEFAULT_LEVERAGE_DIVIDER = 2 * MAX_LEVERAGE_MODIFIER;

export const FODL_MAX_APR = 9999;

export const DEFAULT_FODL_BOT_ADDRESS =
    '0xC07331588c85c9183B667ADd8c250CbE84C1eEaB';
