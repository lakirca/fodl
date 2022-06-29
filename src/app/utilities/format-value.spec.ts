import { formatValue } from './format-value';

describe('Format Value Utility', () => {
    it('should format value', () => {
        expect(formatValue(100000000000)).toBe('100000000000');
        expect(formatValue(100000000000, '$')).toBe('$100,000,000,000');
        expect(formatValue(100000000000, 'USDC')).toBe('100000000000');
        expect(formatValue(-1000000.2780123, '$')).toBe('-$1,000,000');
        expect(formatValue(-1000000.2780123)).toBe('-1000000');
    });
});
