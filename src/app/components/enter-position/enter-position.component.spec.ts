import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EthereumService } from '../../services/ethereum/ethereum.service';
import { EthereumServiceMock } from '../../services/ethereum/ethereum.service.mock';

import { ConfigurationService } from '../../services/configuration/configuration.service';
import { ConfigurationServiceMock } from '../../services/configuration/configuration.service.mock';
import { FoldingService } from '../../services/folding/folding.service';
import { FoldingServiceMock } from '../../services/folding/folding.service.mock';
import { MarketAssumptionService } from '../../services/market-assumption/market-assumption.service';
import { MarketsService } from '../../services/markets/markets.service';
import { MarketsServiceMock } from '../../services/markets/markets.service.mock';
import { SettingsService } from '../../services/settings/settings.service';

import { EnterPositionFormModule } from './enter-position-form/enter-position-form.module';
import { EnterPositionStrategiesModule } from './enter-position-strategies/enter-position-strategies.module';

import { EnterPositionComponent } from './enter-position.component';

describe('EnterPositionComponent', async () => {
    let fixture: ComponentFixture<EnterPositionComponent>;
    let component: EnterPositionComponent;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [EnterPositionComponent],
                imports: [
                    HttpClientTestingModule,
                    MatButtonModule,
                    MatIconModule,
                    EnterPositionFormModule,
                    EnterPositionStrategiesModule,
                ],
                providers: [
                    MarketAssumptionService,
                    SettingsService,
                    {
                        provide: ConfigurationService,
                        useClass: ConfigurationServiceMock,
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
                        provide: MarketsService,
                        useClass: MarketsServiceMock,
                    },
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(EnterPositionComponent);
        component = fixture.debugElement.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });
});
