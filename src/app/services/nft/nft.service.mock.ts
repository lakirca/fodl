import { Observable, of } from 'rxjs';

import { ISnapshotResponse } from '../../interfaces/snapshot.interface';

import { BAYC } from '../../constants/bakc';

export class NftServiceMock {
    getAwardUrl(id: number | string): string {
        return '';
    }

    getBakcAwardsList() {
        return [];
    }

    getBaycAward() {
        return {
            ...BAYC,
            url: this.getAwardUrl('bayc'),
            won: new Date() > new Date(BAYC.date),
            pool: 'BAYC',
        };
    }

    getSnapshot(): Observable<ISnapshotResponse> {
        return of(undefined);
    }

    async getWinners() {
        return await Promise.all(
            [...this.getBakcAwardsList(), this.getBaycAward()].map(
                async (award) => ({
                    award,
                    address: undefined,
                }),
            ),
        );
    }
}
