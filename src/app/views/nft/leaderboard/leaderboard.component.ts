import {
    Component,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
} from '@angular/core';

import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-leaderboard',
    templateUrl: './leaderboard.component.html',
})
export class LeaderboardComponent implements OnInit, OnChanges {
    @Input() leaderboard;

    leaderboard$ = new BehaviorSubject<any>(undefined);
    sortBy$ = new BehaviorSubject<string>('rank');
    search$ = new BehaviorSubject<string>('');

    currentLeaderboard$: Observable<any>;

    ngOnInit() {
        this.currentLeaderboard$ = combineLatest([
            this.leaderboard$,
            this.search$,
            this.sortBy$,
        ]).pipe(
            map(([leaderboard, search, sortBy]) =>
                leaderboard
                    .filter((entry) =>
                        entry.address
                            .toLowerCase()
                            .includes(search.toLowerCase()),
                    )
                    .sort((a, b) => {
                        const desc = sortBy.startsWith('-');
                        const column = sortBy.replace('-', '');

                        return desc
                            ? b[column] - a[column]
                            : a[column] - b[column];
                    }),
            ),
        );
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes?.leaderboard) {
            this.leaderboard$.next(changes.leaderboard.currentValue);
        }
    }

    sortBy(column: string) {
        if (column === this.sortBy$.getValue().replace('-', '')) {
            this.sortBy$.next(
                `${
                    this.sortBy$.getValue().startsWith('-') ? '' : '-'
                }${column}`,
            );
        } else {
            this.sortBy$.next(column);
        }
    }

    updateSearch(search: string) {
        this.search$.next(search);
    }
}
