import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

export const FOLDING_REGISTRY = '0x6C9c903c9e5CD19E1A1cC3BDA0160aa78C36eC72';

export class ConfigurationServiceMock {
    config = {
        exchangeProvider: 'someProvider',
        exchangeSlippage: '1',
        exchangeMainRouteParts: '2',
        exchangeComplexityLevel: '3',
        foldingRegistry: FOLDING_REGISTRY,
        tvl: 'true',
        rewards: 'true',
    };

    config$ = of(this.config);
    configSubject$ = new BehaviorSubject(this.config);

    load = async () => new Promise((resolve) => resolve({}));
    reload = () => {};

    getConfig = (key: string): Observable<string> =>
        this.config$.pipe(map((config) => config[key]));
}
