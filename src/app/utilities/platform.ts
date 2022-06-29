import {
    BSC_PLATFORMS,
    PLATFORMS,
    POLYGON_PLATFORMS,
} from '../constants/blockchain';

import { IPlatform } from './../interfaces/platform.interface';

export const getPlatformName = (address: string): string =>
    [...PLATFORMS, ...BSC_PLATFORMS, ...POLYGON_PLATFORMS].find(
        (platform) => platform.address.toLowerCase() === address.toLowerCase(),
    ).name;

export const getAssetsPlatformName = (assetAddress: string): IPlatform =>
    [...PLATFORMS, ...BSC_PLATFORMS, ...POLYGON_PLATFORMS].find((platform) => {
        return platform.assets.find(
            (asset) =>
                asset.address.toLowerCase() === assetAddress.toLowerCase(),
        );
    });
