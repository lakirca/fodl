import { Injectable } from '@angular/core';

import { ethers } from 'ethers';

import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, first, map } from 'rxjs/operators';

import {
    ASSET_BSCUSDC,
    ASSET_POLYUSDC,
    ASSET_USDC,
    BSC_PLATFORMS,
    PLATFORMS,
    POLYGON_PLATFORMS,
} from '../../constants/blockchain';

import { parseBigNumber } from '../../utilities/big-number';
import { isMarketSafe } from '../../utilities/marketSafe';
import { sumBigNumbers } from '../../utilities/sumBigNumbers';

import {
    ITvlByPlatform,
    ITvlPositionType,
    ITvlResponse,
} from '../../interfaces/tvl.interface';

import { ApiService } from '../api/api.service';

@Injectable()
export class TvlService {
    tvl$: BehaviorSubject<ITvlPositionType[]> = new BehaviorSubject<
        ITvlPositionType[]
    >(undefined);

    constructor(private apiService: ApiService) {
        this.getTvl().subscribe((tvl) => this.tvl$.next(tvl));
    }

    getTvl(): Observable<ITvlPositionType[]> {
        return combineLatest([
            this.apiService.get<ITvlResponse>('tvl').pipe(first()),
            this.apiService.getBsc<ITvlResponse>('tvl').pipe(first()),
            this.apiService.getPolygon<ITvlResponse>('tvl').pipe(first()),
        ]).pipe(
            map(([tvl, tvlBsc, tvlPolygon]) => [
                ...tvl.positionTypes,
                ...tvlBsc.positionTypes,
                ...tvlPolygon.positionTypes,
            ]),
            map((positionTypes) =>
                positionTypes
                    ? positionTypes.map((positionType) => ({
                          ...positionType,
                          positionValue: ethers.BigNumber.from(
                              positionType.positionValue
                                  ? positionType.positionValue.hex
                                  : 0,
                          ),
                          totalValue: ethers.BigNumber.from(
                              positionType.totalValue
                                  ? positionType.totalValue.hex
                                  : 0,
                          ),
                          safe: isMarketSafe(
                              positionType.supplyTokenAddress,
                              positionType.borrowTokenAddress,
                          ),
                      }))
                    : [],
            ),
        );
    }

    getTvlByPlatform(): Observable<ITvlByPlatform[]> {
        const getTotal = (tvl, platform, decimals) =>
            parseBigNumber(
                sumBigNumbers(
                    tvl
                        .filter(
                            (positionType) =>
                                positionType.platformAddress.toLowerCase() ===
                                platform.address.toLowerCase(),
                        )
                        .map((tvl) => tvl.totalValue),
                ),
                decimals,
            );

        return this.tvl$.pipe(
            filter((tvl) => !!tvl),
            map((tvl) => [
                ...PLATFORMS.map((platform) => ({
                    platform,
                    total: getTotal(tvl, platform, ASSET_USDC.decimals),
                })),
                ...BSC_PLATFORMS.map((platform) => ({
                    platform,
                    total: getTotal(tvl, platform, ASSET_BSCUSDC.decimals),
                })),
                ...POLYGON_PLATFORMS.map((platform) => ({
                    platform,
                    total: getTotal(tvl, platform, ASSET_POLYUSDC.decimals),
                })),
            ]),
        );
    }
}
