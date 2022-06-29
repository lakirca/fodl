import { liquidatedEvent } from './liquidatedEvent';

describe('Liquidated Event Utility', () => {
    it('should calculate  price drop resistance', () => {
        const position = {
            supplyMarket: { assetUsdValue: 2 },
            borrowMarket: { assetUsdValue: 1 },
        };
        expect(liquidatedEvent(position)).toEqual(jasmine.any(Number));
        expect(liquidatedEvent(position)).toEqual(jasmine.any(Number));
    });
});
