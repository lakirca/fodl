import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ApiService } from '../../services/api/api.service';
import { ConfigurationService } from '../../services/configuration/configuration.service';
import { ConfigurationServiceMock } from '../../services/configuration/configuration.service.mock';
import { ERC20Service } from '../../services/erc20/erc20.service';
import { ERC20ServiceMock } from '../../services/erc20/erc20.service.mock';
import { EthereumService } from '../../services/ethereum/ethereum.service';
import { EthereumServiceMock } from '../../services/ethereum/ethereum.service.mock';
import { FoldingService } from '../../services/folding/folding.service';
import { FoldingServiceMock } from '../../services/folding/folding.service.mock';
import { FoldingMarketsService } from '../../services/folding/foldingMarkets/foldingMarkets.service';
import { FoldingMarketsServiceMock } from '../../services/folding/foldingMarkets/foldingMarkets.service.mock';
import { GeckoPriceService } from '../../services/gecko-price/gecko-price.service';
import { GeckoPriceServiceMock } from '../../services/gecko-price/gecko-price.service.mock';
import { SettingsService } from '../../services/settings/settings.service';

import { HeaderModule } from '../../components/header/header.module';
import { FooterModule } from '../../components/footer/footer.module';
import { MarketsModule } from '../../components/markets/markets.module';
import { PositionsListModule } from '../../components/positions-list/positions-list.module';
import { EnterPositionModule } from '../../components/enter-position/enter-position.module';

import { HomeComponent } from './home.component';

describe('HomeComponent', async () => {
    let fixture: ComponentFixture<HomeComponent>;
    let component: HomeComponent;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [
                    RouterTestingModule.withRoutes([]),
                    HttpClientTestingModule,
                    MatProgressSpinnerModule,
                    HeaderModule,
                    EnterPositionModule,
                    FooterModule,
                    MarketsModule,
                    PositionsListModule,
                ],
                declarations: [HomeComponent],
                providers: [
                    ApiService,
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
                        provide: FoldingMarketsService,
                        useClass: FoldingMarketsServiceMock,
                    },
                    {
                        provide: GeckoPriceService,
                        useClass: GeckoPriceServiceMock,
                    },
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(HomeComponent);
        component = fixture.debugElement.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });
});
