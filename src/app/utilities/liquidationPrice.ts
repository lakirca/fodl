import { IPosition } from '../interfaces/position.interface';

export const liquidationPrice = (position: IPosition): number =>
    position.borrowAmountUsd /
    (position.supplyAmountUsd * position.supplyMarket.liquidationFactor);
