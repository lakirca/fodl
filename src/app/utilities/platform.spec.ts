import { PLATFORM_AAVE, PLATFORM_COMPOUND } from '../constants/blockchain';

import { getPlatformName } from './platform';

describe('Platform Utility', () => {
    it('should check if the asset is the same', () => {
        expect(getPlatformName(PLATFORM_AAVE)).toEqual('Aave');

        expect(getPlatformName(PLATFORM_COMPOUND)).toEqual('Compound');
    });
});
