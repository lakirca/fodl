import { priceDropResistance } from './priceDropResistance';

export const liquidatedEvent = (position): number => {
    const amount = position.borrowAmount / position.supplyAmount || 0;

    return ((100 - priceDropResistance(position)) * amount) / 100;
};
