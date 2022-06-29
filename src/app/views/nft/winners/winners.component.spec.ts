import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { MatDialogModule } from '@angular/material/dialog';

import { EthereumService } from '../../../services/ethereum/ethereum.service';
import { EthereumServiceMock } from '../../../services/ethereum/ethereum.service.mock';
import { NftService } from '../../../services/nft/nft.service';
import { NftServiceMock } from '../../../services/nft/nft.service.mock';

import { WinnersComponent } from './winners.component';

describe('WinnersComponent', async () => {
    let fixture: ComponentFixture<WinnersComponent>;
    let component: WinnersComponent;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [HttpClientTestingModule, MatDialogModule],
                declarations: [WinnersComponent],
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
        fixture = TestBed.createComponent(WinnersComponent);
        component = fixture.debugElement.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });
});
