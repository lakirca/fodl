import { DEFAULT_ROUNDING } from '../constants/blockchain';

import { isStableCoin } from './stableCoin';

export const isFiat = (symbol: string): boolean =>
    symbol && symbol.length === 1;

export const isStable = (symbol: string): boolean =>
    symbol && isStableCoin(symbol);

export const getPrecision = (
    value: number,
    symbol = '',
    precision = -1,
): number =>
    symbol === '%'
        ? 2
        : Math.abs(value) > 1000
        ? 0
        : precision >= 0
        ? precision
        : isFiat(symbol) || isStable(symbol) || symbol === ''
        ? 2
        : DEFAULT_ROUNDING;

export const formatNumber = (
    value: number,
    symbol = '',
    precision = -1,
): number => {
    const multiplier = Math.pow(10, getPrecision(value, symbol, precision));

    return Math.floor(Math.abs(value * multiplier)) / multiplier;
};

export const formatValue = (
    value: number,
    symbol = '',
    precision = -1,
): string => {
    const outputPrecision = getPrecision(value, symbol, precision);

    return `${
        value && parseFloat(value.toFixed(outputPrecision)) <= -0.00001
            ? '-'
            : ''
    }${symbol?.length === 1 && symbol !== '%' ? symbol : ''}${formatNumber(
        value,
        symbol,
        precision,
    )
        .toFixed(outputPrecision)
        .replace(
            /\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g,
            symbol?.length === 1 ? ',' : '',
        )}${symbol === '%' ? symbol : ''}`;
};
