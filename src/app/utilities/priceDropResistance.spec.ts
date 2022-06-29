import { priceDropResistance } from './priceDropResistance';

describe('Price Drop Resistance Utility', () => {
    it('should calculate  price drop resistance', () => {
        const position = {
            leverage: 2,
            borrowMarket: { liquidationFactor: 2 },
            supplyMarket: { liquidationFactor: 2 },
        };

        expect(priceDropResistance(position as any)).toEqual(
            jasmine.any(Number),
        );

        expect(priceDropResistance(position as any)).toEqual(
            jasmine.any(Number),
        );
    });
});
