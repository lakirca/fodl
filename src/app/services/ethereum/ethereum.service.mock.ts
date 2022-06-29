import { providers, Signer } from 'ethers';

import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export const MOCK_WALLET_ADDRESS = '0xb1adceddb2941033a090dd166a462fe1c2029484';

export class EthereumServiceMock {
    private ethereum = {};
    private provider: providers.Web3Provider;

    connectedSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        false,
    );

    connected$: Observable<boolean>;

    account$: BehaviorSubject<string> = new BehaviorSubject<string>(undefined);

    constructor() {
        this.connected$ = this.connectedSubject$.pipe(
            filter((value) => !!value),
        );
    }

    on(event: string, callback) {}

    getAccount() {
        return this.account$.getValue();
    }

    getEthereum() {
        return this.ethereum;
    }

    getEthereumProvider() {
        return undefined;
    }

    getBaseProvider(): providers.BaseProvider {
        return this.provider;
    }

    getSigner(): Signer {
        return this.provider.getSigner();
    }

    isMetamaskInstalled(): boolean {
        return !!this.ethereum;
    }

    async connect() {
        this.account$.next(MOCK_WALLET_ADDRESS);

        return true;
    }

    disconnect() {
        this.account$.next(undefined);
    }

    async switchChain() {
        return;
    }

    async requestAccounts() {
        return;
    }
}
