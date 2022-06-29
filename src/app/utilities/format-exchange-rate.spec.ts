import { formatExchangeRate } from './format-exchange-rate';

describe('Format Exchange Rate Utility', () => {
    it('should exchange rate', () => {
        expect(formatExchangeRate(1, 'WETH', 'WBTC')).toBe(
            '1.00000000 WETH/WBTC',
        );

        expect(formatExchangeRate(0.1, 'WETH', 'WBTC')).toBe(
            '10.00000000 WBTC/WETH',
        );

        expect(formatExchangeRate(0.1, 'WETH', 'WBTC', 'long')).toBe(
            '1 WETH = 10.00000000 WBTC',
        );

        expect(formatExchangeRate(0.1, 'WETH', 'WBTC', 'short')).toBe(
            '10.00000000',
        );

        expect(formatExchangeRate(0.1, 'WETH', 'WBTC', 'exchange')).toBe(
            'WBTC/WETH',
        );

        expect(formatExchangeRate(0.1, 'WETH', 'WBTC', 'source')).toBe('WBTC');

        expect(formatExchangeRate(0.1, 'WETH', 'WBTC', 'sourceOnly')).toBe(
            '10.00000000 WBTC',
        );

        expect(formatExchangeRate(0.1, 'WETH', 'WBTC', 'destination')).toBe(
            'WETH',
        );
    });
});
