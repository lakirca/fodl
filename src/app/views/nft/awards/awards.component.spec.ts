import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EthereumService } from '../../../services/ethereum/ethereum.service';
import { EthereumServiceMock } from '../../../services/ethereum/ethereum.service.mock';
import { NftService } from '../../../services/nft/nft.service';
import { NftServiceMock } from '../../../services/nft/nft.service.mock';

import { AwardsComponent } from './awards.component';

describe('AwardsComponent', async () => {
    let fixture: ComponentFixture<AwardsComponent>;
    let component: AwardsComponent;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [HttpClientTestingModule],
                declarations: [AwardsComponent],
                providers: [
                    {
                        provide: NftService,
                        useClass: NftServiceMock,
                    },
                    {
                        provide: EthereumService,
                        useClass: EthereumServiceMock,
                    },
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(AwardsComponent);
        component = fixture.debugElement.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });
});
