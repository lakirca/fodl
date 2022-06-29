import { TestBed, waitForAsync } from '@angular/core/testing';

import { ConfigurationService } from '../configuration/configuration.service';
import { ConfigurationServiceMock } from '../configuration/configuration.service.mock';

import { EthereumService } from './ethereum.service';

export const ETHEREUM_MOCK = {
    on: () => {},
};

describe('EthereumService', () => {
    let service: EthereumService;

    beforeEach(
        waitForAsync(() => {
            (window as any).ethereum = ETHEREUM_MOCK;

            TestBed.configureTestingModule({
                providers: [
                    EthereumService,
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

        service = TestBed.get(EthereumService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
