import { convertMarketAsset } from './convertMarketAsset';

const MARKETDATA = require('../../fixtures/market.json');

describe('Convert Market Asset Utility', () => {
    it('should convert folding market to market asset', async () => {
        expect(await convertMarketAsset(MARKETDATA)).toEqual({
            asset: {
                name: 'assetSymbol',
                address: 'assetAddress',
                platformAddress: 'address',
                platformName: 'name',
            },
            apy: 0,
            borrowAPR: 10,
            borrowDistributionAPR: 10,
        });
    });
});
