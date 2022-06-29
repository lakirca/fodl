import { TestBed, waitForAsync } from '@angular/core/testing';

import { ConfigurationService } from '../configuration/configuration.service';
import { ConfigurationServiceMock } from '../configuration/configuration.service.mock';

import { LeverageService } from './leverage.service';

describe('LeverageService', () => {
    let service: LeverageService;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                providers: [
                    LeverageService,
                    {
                        provide: ConfigurationService,
                        useClass: ConfigurationServiceMock,
                    },
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        TestBed.configureTestingModule({});

        service = TestBed.get(LeverageService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
