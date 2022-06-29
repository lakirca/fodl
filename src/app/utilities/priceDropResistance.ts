import { IPosition } from '../interfaces/position.interface';

export const priceDropResistance = (position: IPosition): number => {
    const l = position.leverage;
    const c = position.supplyMarket?.liquidationFactor || 0.25;

    const liq = 1 + 1 / (c * l) - 1 / c;

    return liq * 100;
};
