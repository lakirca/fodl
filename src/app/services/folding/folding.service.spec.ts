import { TestBed, waitForAsync } from '@angular/core/testing';

import { filter } from 'rxjs/operators';

import { ConfigurationService } from '../configuration/configuration.service';
import { ConfigurationServiceMock } from '../configuration/configuration.service.mock';
import { ERC20Service } from '../erc20/erc20.service';
import {
    ERC20ServiceMock,
    WBTC_ADDRESS_MOCK,
} from '../erc20/erc20.service.mock';
import { EthereumService } from '../ethereum/ethereum.service';
import { EthereumServiceMock } from '../ethereum/ethereum.service.mock';
import { FoldingMarketsService } from './foldingMarkets/foldingMarkets.service';
import { FoldingMarketsServiceMock } from './foldingMarkets/foldingMarkets.service.mock';
import { FoldingPositionsService } from './foldingPositions/foldingPositions.service';
import { FoldingPositionsServiceMock } from './foldingPositions/foldingPositions.service.mock';
import { FoldingRegistryService } from './foldingRegistry/foldingRegistry.service';
import { FoldingRegistryServiceMock } from './foldingRegistry/foldingRegistry.service.mock';
import { FoldingRewardsService } from './foldingRewards/foldingRewards.service';
import { FoldingRewardsServiceMock } from './foldingRewards/foldingRewards.service.mock';
import { GeckoPriceService } from '../gecko-price/gecko-price.service';
import { GeckoPriceServiceMock } from '../gecko-price/gecko-price.service.mock';
import { MarketsService } from '../markets/markets.service';
import { MarketsServiceMock } from '../markets/markets.service.mock';
import { TvlService } from '../tvl/tvl.service';
import { TvlServiceMock } from '../tvl/tvl.service.mock';

import { FoldingService } from './folding.service';

describe('FoldingService', () => {
    let service: FoldingService;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                providers: [
                    FoldingService,
                    {
                        provide: ConfigurationService,
                        useClass: ConfigurationServiceMock,
                    },
                    {
                        provide: ERC20Service,
                        useClass: ERC20ServiceMock,
                    },
                    {
                        provide: EthereumService,
                        useClass: EthereumServiceMock,
                    },
                    {
                        provide: FoldingRegistryService,
                        useClass: FoldingRegistryServiceMock,
                    },
                    {
                        provide: FoldingMarketsService,
                        useClass: FoldingMarketsServiceMock,
                    },
                    {
                        provide: FoldingPositionsService,
                        useClass: FoldingPositionsServiceMock,
                    },
                    {
                        provide: FoldingRewardsService,
                        useClass: FoldingRewardsServiceMock,
                    },
                    {
                        provide: GeckoPriceService,
                        useClass: GeckoPriceServiceMock,
                    },
                    {
                        provide: MarketsService,
                        useClass: MarketsServiceMock,
                    },
                    {
                        provide: TvlService,
                        useClass: TvlServiceMock,
                    },
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        TestBed.configureTestingModule({});

        service = TestBed.get(FoldingService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get folding accounts', async () => {
        const accounts = ['account 1', 'account 2'];

        spyOn(
            service['foldingRegistryService'],
            'getFoldingAccounts',
        ).and.returnValue(new Promise((res) => res(accounts)));

        service.accounts$
            .pipe(filter((retAccounts) => !!retAccounts.length))
            .subscribe((retAccounts) => {
                expect(retAccounts).toEqual(accounts);

                expect(
                    service['foldingRegistryService'].getFoldingAccounts,
                ).toHaveBeenCalled();
            });

        service.getFoldingAccounts();
    });

    it('should approve allowance', async () => {
        const account = 'account';
        const approveToken = WBTC_ADDRESS_MOCK;
        const approveAllowance = 1;

        spyOn(service['erc20service'], 'approveAllowance').and.callThrough();

        service
            .approveAllowance(account, approveToken, approveAllowance)
            .subscribe(() =>
                expect(
                    service['erc20service'].approveAllowance,
                ).toHaveBeenCalledWith(account, approveToken, approveAllowance),
            );
    });
});
