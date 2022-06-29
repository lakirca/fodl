import { Injectable } from '@angular/core';

import { Contract, providers, Signer } from 'ethers';

import { BehaviorSubject, Observable } from 'rxjs';
import { filter, first, tap } from 'rxjs/operators';

import WalletConnectProvider from '@walletconnect/web3-provider';

import Web3Modal from 'web3modal';

import { NETWORK_INTERVAL } from '../../constants/commons';
import {
    ASSETS,
    ASSET_BSCDAI,
    ASSET_BSCETH,
    ASSET_BSCUSDC,
    ASSET_DAI,
    ASSET_POLYDAI,
    ASSET_POLYUSDC,
    ASSET_POLYWETH,
    ASSET_USDC,
    ASSET_WETH,
    BSC,
    BSC_ASSETS,
    BSC_BLOCK_EXPLORER,
    BSC_DEFAULT_EXCHANGE,
    BSC_PLATFORMS,
    BSC_RPC_URL,
    BSC_SYMBOL,
    DEFAULT_NETWORK,
    ETH_DECIMALS,
    MAINNET,
    MIN_CONFIRMATIONS_BSC,
    MIN_CONFIRMATIONS_ETHEREUM,
    MIN_CONFIRMATIONS_POLYGON,
    PANCAKESWAP_ROUTER,
    PLATFORMS,
    PLATFORM_COMPOUND,
    PLATFORM_POLYAAVE,
    PLATFORM_VENUS,
    POLYGON,
    POLYGON_ASSETS,
    POLYGON_BLOCK_EXPLORER,
    POLYGON_DEFAULT_EXCHANGE,
    POLYGON_PLATFORMS,
    POLYGON_RPC_URL,
    POLYGON_SYMBOL,
    QUICKSWAP_ROUTER,
    UNISWAP_V3_QUOTER,
} from '../../constants/blockchain';

import { ConfigurationService } from '../configuration/configuration.service';
import { pancakeRouterAbi } from 'src/abis/pancake';
import { uniswapV3quoterAbi } from 'src/abis/uniswapV3';
import {
    AllConnectors,
    AllConnectorsBSC,
    AllConnectorsBSC__factory,
    AllConnectorsPolygon__factory,
    AllConnectors__factory,
} from '@0xb1/fodl-typechain';

@Injectable()
export class EthereumService {
    private ethereum: any;
    private provider: providers.Web3Provider;
    private interval: NodeJS.Timeout;

    switching = false;

    connectedSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        false,
    );

    connected$: Observable<boolean>;

    network$: BehaviorSubject<string> = new BehaviorSubject<string>(undefined);

    account$: BehaviorSubject<string> = new BehaviorSubject<string>(undefined);

    constructor(private configurationService: ConfigurationService) {
        this.configurationService
            .getConfig('network')
            .subscribe((network) =>
                this.network$.next(network || DEFAULT_NETWORK),
            );

        this.connected$ = this.connectedSubject$.pipe(
            tap(
                (connected) =>
                    (this.provider = connected
                        ? new providers.Web3Provider(this.ethereum)
                        : undefined),
            ),
        );

        this.autoConnect();
    }

    getEthereumAccounts() {
        this.connected$
            .pipe(
                filter((connected) => !!connected),
                first(),
            )
            .subscribe(() => {
                this.on('accountsChanged', (accounts: string[]) =>
                    this.account$.next(
                        accounts.length ? accounts[0] : undefined,
                    ),
                );

                if (this.ethereum.selectedAddress) {
                    this.account$.next(this.ethereum.selectedAddress);
                }
            });
    }

    autoConnect() {
        if (window.localStorage.getItem('WEB3_CONNECT_CACHED_PROVIDER')) {
            this.configurationService.config$.subscribe(() => this.connect());
        } else {
            this.ethereum = (window as any).ethereum;

            this.checkChain();
        }
    }

    async connect() {
        this.connectedSubject$.next(false);

        const config = this.configurationService.configSubject$.getValue();

        const chainId = config.chainId;

        let options = {};

        if (chainId && chainId !== MAINNET) {
            let rpc = {};

            rpc[parseInt(chainId)] = config.rpcUrl;

            options = {
                rpc,
            };
        } else {
            options = {
                infuraId: config.infuraId,
            };
        }

        const providerOptions = {
            walletconnect: {
                package: WalletConnectProvider,
                options,
            },
        };

        const web3Modal = new Web3Modal({
            cacheProvider: true,
            providerOptions,
        });

        try {
            this.ethereum = await web3Modal.connect();
        } catch (_) {}

        if (this.ethereum?.accounts) {
            this.account$.next(this.ethereum.accounts[0]);
        } else {
            this.getEthereumAccounts();
        }

        this.checkChain();
    }

    disconnect() {
        window.localStorage.removeItem('WEB3_CONNECT_CACHED_PROVIDER');
        window.localStorage.removeItem('WALLETCONNECT_DEEPLINK_CHOICE');
        window.localStorage.removeItem('walletconnect');

        this.account$.next(undefined);
    }

    on(event: string, callback) {
        try {
            this.ethereum.on(event, callback);
        } catch {}
    }

    getEthereum() {
        return this.ethereum;
    }

    getEthereumProvider(): providers.BaseProvider {
        return new providers.StaticJsonRpcProvider(
            'https://rpc.flashbots.net/',
        );
    }

    getBaseProvider(): providers.BaseProvider {
        return this.provider;
    }

    getSigner(): Signer {
        return this.provider?.getSigner();
    }

    isMetamaskInstalled(): boolean {
        return !!this.ethereum;
    }

    isEthereumNetwork(): boolean {
        return this.getNetwork() === 'ethereum';
    }

    getNetwork(): string {
        return this.network$.getValue();
    }

    getAccount(): string {
        return this.account$.getValue();
    }

    getMinimumConfirmations(): number {
        switch (this.getNetwork()) {
            case 'bsc':
                return MIN_CONFIRMATIONS_BSC;

            case 'polygon':
                return MIN_CONFIRMATIONS_POLYGON;

            default:
                return MIN_CONFIRMATIONS_ETHEREUM;
        }
    }

    getNetworkSimplePositionLens(): string {
        const config = this.configurationService.configSubject$.getValue();

        switch (this.getNetwork()) {
            case 'bsc':
                return config.bscSimplePositionLens;

            case 'polygon':
                return config.polygonSimplePositionLens;

            default:
                return config.simplePositionLens;
        }
    }

    getNetworkLendingLens(): string {
        const config = this.configurationService.configSubject$.getValue();

        switch (this.getNetwork()) {
            case 'bsc':
                return config.bscLendingPlatformLens;

            case 'polygon':
                return config.polygonLendingPlatformLens;

            default:
                return config.lendingPlatformLens;
        }
    }

    getNetworkFoldingRegistry() {
        const config = this.configurationService.configSubject$.getValue();

        switch (this.getNetwork()) {
            case 'bsc':
                return config.bscFoldingRegistry;

            case 'polygon':
                return config.polygonFoldingRegistry;

            default:
                return config.foldingRegistry;
        }
    }

    getNetworkFoldingRewardsDistributor() {
        const config = this.configurationService.configSubject$.getValue();

        switch (this.getNetwork()) {
            case 'bsc':
                return config.bscRewardsDistributor;

            case 'polygon':
                return config.polygonRewardsDistributor;

            default:
                return config.rewardsDistributor;
        }
    }

    getNetworkPlatforms() {
        switch (this.getNetwork()) {
            case 'bsc':
                return BSC_PLATFORMS;

            case 'polygon':
                return POLYGON_PLATFORMS;

            default:
                return PLATFORMS;
        }
    }

    getNetworkAssets() {
        switch (this.getNetwork()) {
            case 'bsc':
                return BSC_ASSETS;

            case 'polygon':
                return POLYGON_ASSETS;

            default:
                return ASSETS;
        }
    }

    getNetworkSpecificUSDC() {
        switch (this.getNetwork()) {
            case 'bsc':
                return ASSET_BSCUSDC;

            case 'polygon':
                return ASSET_POLYUSDC;

            default:
                return ASSET_USDC;
        }
    }

    getNetworkSpecificDefaultPlatform() {
        switch (this.getNetwork()) {
            case 'bsc':
                return PLATFORM_VENUS;

            case 'polygon':
                return PLATFORM_POLYAAVE;

            default:
                return PLATFORM_COMPOUND;
        }
    }

    getNetworkSpecificDefaultSupplyAsset() {
        switch (this.getNetwork()) {
            case 'bsc':
                return ASSET_BSCETH;

            case 'polygon':
                return ASSET_POLYWETH;

            default:
                return ASSET_WETH;
        }
    }

    getNetworkSpecificDefaultBorrowAsset() {
        switch (this.getNetwork()) {
            case 'bsc':
                return ASSET_BSCDAI;

            case 'polygon':
                return ASSET_POLYDAI;

            default:
                return ASSET_DAI;
        }
    }

    getNetworkQuoter() {
        switch (this.getNetwork()) {
            case 'bsc':
                return new Contract(
                    PANCAKESWAP_ROUTER,
                    pancakeRouterAbi,
                    this.getBaseProvider(),
                );

            case 'polygon':
                return new Contract(
                    QUICKSWAP_ROUTER,
                    pancakeRouterAbi,
                    this.getBaseProvider(),
                );

            default:
                return new Contract(
                    UNISWAP_V3_QUOTER,
                    uniswapV3quoterAbi,
                    this.getBaseProvider(),
                );
        }
    }

    getNetworkAllConnectors(account: string): AllConnectors | AllConnectorsBSC {
        switch (this.getNetwork()) {
            case 'bsc':
                return AllConnectorsBSC__factory.connect(
                    account,
                    this.getSigner(),
                );

            case 'polygon':
                return AllConnectorsPolygon__factory.connect(
                    account,
                    this.getSigner(),
                ) as any;

            default:
                return AllConnectors__factory.connect(
                    account,
                    this.getSigner(),
                );
        }
    }

    getNetworkDefaultExchange(): string {
        switch (this.getNetwork()) {
            case 'bsc':
                return BSC_DEFAULT_EXCHANGE;

            case 'polygon':
                return POLYGON_DEFAULT_EXCHANGE;

            default:
                return '';
        }
    }

    checkChain() {
        this.on('chainChanged', (chainId: string) => {
            const config = this.configurationService.configSubject$.getValue();

            let connected = false;

            switch (this.getNetwork()) {
                case 'bsc':
                    connected = chainId === (config.bscChainId || BSC);
                    break;

                case 'polygon':
                    connected = chainId === (config.polygonChainId || POLYGON);
                    break;

                default:
                    connected =
                        chainId === (config.chainId || MAINNET) ||
                        chainId === '0x31337' ||
                        chainId === '0x1337';
                    break;
            }

            this.connectedSubject$.next(connected);

            this.switching = false;
        });

        if (this.interval) {
            clearInterval(this.interval);
        }

        this.interval = setInterval(() => {
            if (this.ethereum?.chainId) {
                this.configurationService.config$.subscribe((config) => {
                    const chainIdHex = `0x${parseInt(
                        this.ethereum.chainId,
                    ).toString(16)}`;

                    let connected = false;

                    switch (config.network) {
                        case 'bsc':
                            connected =
                                chainIdHex === (config.bscChainId || BSC);
                            break;

                        case 'polygon':
                            connected =
                                chainIdHex ===
                                (config.polygonChainId || POLYGON);
                            break;

                        default:
                            connected =
                                chainIdHex ===
                                    (config.chainId || MAINNET).toLowerCase() ||
                                chainIdHex === '0x31337' ||
                                chainIdHex === '0x1337';
                    }

                    if (connected) {
                        clearInterval(this.interval);

                        this.connectedSubject$.next(true);
                    } else {
                        this.switchChain(this.getNetwork());
                    }
                });
            }
        }, NETWORK_INTERVAL);
    }

    async switchChain(network: string) {
        this.connectedSubject$.next(false);
        this.network$.next(network);

        const config = this.configurationService.configSubject$.getValue();

        if (!this.switching) {
            this.switching = true;

            try {
                let chainId;

                switch (network) {
                    case 'bsc':
                        chainId = config.bscChainId || BSC;
                        break;

                    case 'polygon':
                        chainId = config.polygonChainId || POLYGON;
                        break;

                    default:
                        chainId = config.chainId || MAINNET;
                }

                await this.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [
                        {
                            chainId,
                        },
                    ],
                });
            } catch {
                try {
                    let params;

                    if (network === 'ethereum') {
                        params = {
                            chainName: config.rpcUrl.replace(
                                /(^\w+:|^)\/\//,
                                '',
                            ),
                            chainId: config.chainId,
                            rpcUrls: [config.rpcUrl],
                        };
                    } else if (network === 'bsc') {
                        params = {
                            chainName: config.bscRpcUrl
                                ? config.bscRpcUrl.replace(/(^\w+:|^)\/\//, '')
                                : 'Binance Smart Chain',
                            chainId: config.bscChainId || BSC,
                            rpcUrls: [config.bscRpcUrl || BSC_RPC_URL],
                            nativeCurrency: {
                                name: BSC_SYMBOL,
                                symbol: BSC_SYMBOL,
                                decimals: ETH_DECIMALS,
                            },
                            blockExplorerUrls: [BSC_BLOCK_EXPLORER],
                        };
                    } else if (network === 'polygon') {
                        params = {
                            chainName: config.polygonRpcUrl
                                ? config.polygonRpcUrl.replace(
                                      /(^\w+:|^)\/\//,
                                      '',
                                  )
                                : 'Polygon',
                            chainId: config.polygonChainId || POLYGON,
                            rpcUrls: [config.polygonRpcUrl || POLYGON_RPC_URL],
                            nativeCurrency: {
                                name: POLYGON_SYMBOL,
                                symbol: POLYGON_SYMBOL,
                                decimals: ETH_DECIMALS,
                            },
                            blockExplorerUrls: [POLYGON_BLOCK_EXPLORER],
                        };
                    }

                    await this.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [params],
                    });
                } catch {
                    return;
                }
            }
        }
    }

    async requestAccounts() {
        if (!this.isMetamaskInstalled()) {
            return;
        }

        try {
            await this.ethereum.request({
                method: 'eth_requestAccounts',
            });
        } catch {}
    }
}
