import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { MatDialogRef } from '@angular/material/dialog';

import { SettingsService } from '../../services/settings/settings.service';
import { FoldingService } from '../../services/folding/folding.service';
import { FoldingServiceMock } from '../../services/folding/folding.service.mock';
import { MarketsServiceMock } from './../../services/markets/markets.service.mock';
import { MarketsService } from '../../services/markets/markets.service';
import { ApiService } from '../../services/api/api.service';
import { ConfigurationService } from '../../services/configuration/configuration.service';
import { ConfigurationServiceMock } from '../../services/configuration/configuration.service.mock';
import { ERC20Service } from '../../services/erc20/erc20.service';
import { ERC20ServiceMock } from '../../services/erc20/erc20.service.mock';
import { EthereumService } from '../../services/ethereum/ethereum.service';
import { EthereumServiceMock } from '../../services/ethereum/ethereum.service.mock';
import { FoldingMarketsService } from '../../services/folding/foldingMarkets/foldingMarkets.service';
import { FoldingMarketsServiceMock } from '../../services/folding/foldingMarkets/foldingMarkets.service.mock';
import { GeckoPriceService } from '../../services/gecko-price/gecko-price.service';
import { GeckoPriceServiceMock } from '../../services/gecko-price/gecko-price.service.mock';
import { MarketAssumptionService } from '../../services/market-assumption/market-assumption.service';

import { EditLeverageComponent } from './edit-leverage.component';

describe('EditLeverageComponent', async () => {
    let fixture: ComponentFixture<EditLeverageComponent>;
    let component: EditLeverageComponent;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [
                    RouterTestingModule.withRoutes([]),
                    HttpClientTestingModule,
                ],
                declarations: [EditLeverageComponent],
                providers: [
                    ApiService,
                    SettingsService,
                    MarketAssumptionService,
                    {
                        provide: ConfigurationService,
                        useClass: ConfigurationServiceMock,
                    },
                    {
                        provide: MatDialogRef,
                        useValue: {},
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
                    {
                        provide: MarketsService,
                        useClass: MarketsServiceMock,
                    },
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(EditLeverageComponent);
        component = fixture.debugElement.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });
});
