import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { FormatValuePipeModule } from '../../../pipes/format-value/format-value.pipe.module';

import { EthereumService } from '../../../services/ethereum/ethereum.service';
import { EthereumServiceMock } from '../../../services/ethereum/ethereum.service.mock';
import { LPService } from '../../../services/lp/lp.service';
import { LPServiceMock } from '../../../services/lp/lp.service.mock';
import { StakingService } from '../../../services/staking/staking.service';
import { StakingServiceMock } from '../../../services/staking/staking.service.mock';

import { StakeComponent } from './stake.component';

describe('StakeComponent', async () => {
    let fixture: ComponentFixture<StakeComponent>;
    let component: StakeComponent;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [StakeComponent],
                imports: [
                    MatButtonModule,
                    MatDialogModule,
                    FormatValuePipeModule,
                ],
                providers: [
                    {
                        provide: EthereumService,
                        useClass: EthereumServiceMock,
                    },
                    {
                        provide: LPService,
                        useClass: LPServiceMock,
                    },
                    {
                        provide: StakingService,
                        useClass: StakingServiceMock,
                    },
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(StakeComponent);
        component = fixture.debugElement.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });
});
