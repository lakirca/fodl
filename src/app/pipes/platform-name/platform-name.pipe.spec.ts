import { PLATFORM_AAVE, PLATFORM_COMPOUND } from '../../constants/blockchain';

import { PlatformNamePipe } from './platform-name.pipe';

describe('PlatformName Pipe', () => {
    let pipe: PlatformNamePipe;

    beforeEach(() => {
        pipe = new PlatformNamePipe();
    });

    it('should get platform name', () => {
        expect(pipe.transform(PLATFORM_AAVE)).toBe('Aave');
        expect(pipe.transform(PLATFORM_COMPOUND)).toBe('Compound');
    });
});
