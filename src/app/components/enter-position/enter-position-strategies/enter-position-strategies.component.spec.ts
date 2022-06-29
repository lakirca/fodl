import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';

import { FormatValuePipeModule } from '../../../pipes/format-value/format-value.pipe.module';

import { ConfigurationService } from '../../../services/configuration/configuration.service';
import { ConfigurationServiceMock } from '../../../services/configuration/configuration.service.mock';
import { FoldingService } from '../../../services/folding/folding.service';
import { FoldingServiceMock } from '../../../services/folding/folding.service.mock';
import { MarketAssumptionService } from '../../../services/market-assumption/market-assumption.service';
import { MarketsService } from '../../../services/markets/markets.service';
import { MarketsServiceMock } from '../../../services/markets/markets.service.mock';
import { SettingsService } from '../../../services/settings/settings.service';

import { IconAssetModule } from '../../icon-asset/icon-asset.module';

import { EnterPositionStrategiesComponent } from './enter-position-strategies.component';

describe('EnterPositionStrategiesComponent', async () => {
    let fixture: ComponentFixture<EnterPositionStrategiesComponent>;
    let component: EnterPositionStrategiesComponent;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [
                    HttpClientTestingModule,
                    FormatValuePipeModule,
                    IconAssetModule,
                ],
                providers: [
                    MarketAssumptionService,
                    SettingsService,
                    {
                        provide: ConfigurationService,
                        useClass: ConfigurationServiceMock,
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
                declarations: [EnterPositionStrategiesComponent],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(EnterPositionStrategiesComponent);
        component = fixture.debugElement.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });
});
