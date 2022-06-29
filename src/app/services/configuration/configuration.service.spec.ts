import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed, waitForAsync } from '@angular/core/testing';

import { ConfigurationService } from './configuration.service';

describe('ConfigurationService', () => {
    let service: ConfigurationService;
    let httpMock: HttpTestingController;
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ConfigurationService],
        }).compileComponents();
    }));

    beforeEach(() => {
        TestBed.configureTestingModule({});

        service = TestBed.get(ConfigurationService);
        httpMock = TestBed.get(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should load config', () => {
        expect(service).toBeTruthy();

        const config = { key: 'value' };

        httpMock
            .expectOne((req) => req.url.endsWith('config.json'))
            .flush(config);

        service.config$.subscribe((serviceConfig) =>
            expect(serviceConfig).toEqual(config),
        );
    });
});
