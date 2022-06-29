export const aprToApy = (apr: number): number =>
    (Math.pow(1 + apr / 100 / 365, 365) - 1) * 100;
