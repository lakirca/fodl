import { Observable, of } from 'rxjs';

import {
    ITvlByPlatform,
    ITvlPositionType,
} from '../../interfaces/tvl.interface';

export class TvlServiceMock {
    getTvl(): Observable<ITvlPositionType[]> {
        return of([]);
    }

    getTvlByPlatform(): Observable<ITvlByPlatform[]> {
        return of([]);
    }
}
