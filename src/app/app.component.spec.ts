import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ConfigurationService } from './services/configuration/configuration.service';
import { ConfigurationServiceMock } from './services/configuration/configuration.service.mock';
import { ERC20Service } from './services/erc20/erc20.service';
import { ERC20ServiceMock } from './services/erc20/erc20.service.mock';
import { EthereumService } from './services/ethereum/ethereum.service';
import { EthereumServiceMock } from './services/ethereum/ethereum.service.mock';
import { FoldingService } from './services/folding/folding.service';
import { FoldingServiceMock } from './services/folding/folding.service.mock';
import { GeckoPriceService } from './services/gecko-price/gecko-price.service';
import { GeckoPriceServiceMock } from './services/gecko-price/gecko-price.service.mock';
import { LPService } from './services/lp/lp.service';
import { LPServiceMock } from './services/lp/lp.service.mock';
import { MarketsService } from './services/markets/markets.service';
import { MarketsServiceMock } from './services/markets/markets.service.mock';
import { StakingService } from './services/staking/staking.service';
import { StakingServiceMock } from './services/staking/staking.service.mock';
import { TvlService } from './services/tvl/tvl.service';
import { TvlServiceMock } from './services/tvl/tvl.service.mock';
import { SettingsService } from './services/settings/settings.service';

import { BackgroundModule } from './components/background/background.module';
import { EnterPositionModule } from './components/enter-position/enter-position.module';
import { HeaderModule } from './components/header/header.module';
import { FooterModule } from './components/footer/footer.module';
import { MarketsModule } from './components/markets/markets.module';
import { PositionsListModule } from './components/positions-list/positions-list.module';

import { AppComponent } from './app.component';

describe('AppComponent', async () => {
    let fixture: ComponentFixture<AppComponent>;
    let component: AppComponent;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [
                    RouterTestingModule.withRoutes([]),
                    BrowserAnimationsModule,
                    HttpClientTestingModule,
                    MatProgressSpinnerModule,
                    BackgroundModule,
                    HeaderModule,
                    EnterPositionModule,
                    FooterModule,
                    MarketsModule,
                    PositionsListModule,
                ],
                declarations: [AppComponent],
                providers: [
                    SettingsService,
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
                        provide: FoldingService,
                        useClass: FoldingServiceMock,
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
                    {
                        provide: LPService,
                        useClass: LPServiceMock,
                    },
                    {
                        provide: StakingService,
                        useClass: StakingServiceMock,
                    },
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.debugElement.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });
});
