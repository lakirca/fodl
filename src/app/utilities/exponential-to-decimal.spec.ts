import { exponentialToDecimal } from './exponential-to-decimal';

describe('Exponential to Decimal Utility', () => {
    it('should calculate exponential to decimal for given value', () => {
        expect(exponentialToDecimal(1)).toBe('$1');
    });
});
