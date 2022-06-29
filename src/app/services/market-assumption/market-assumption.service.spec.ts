import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed, waitForAsync } from '@angular/core/testing';

import { ConfigurationService } from '../configuration/configuration.service';
import { ConfigurationServiceMock } from '../configuration/configuration.service.mock';
import { FoldingService } from '../folding/folding.service';
import { FoldingServiceMock } from '../folding/folding.service.mock';
import { SettingsService } from '../settings/settings.service';

import { MarketAssumptionService } from './market-assumption.service';

describe('MarketAssumptionService', () => {
    let service: MarketAssumptionService;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [HttpClientTestingModule],
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
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        TestBed.configureTestingModule({});

        service = TestBed.get(MarketAssumptionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
