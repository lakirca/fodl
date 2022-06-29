import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { FormatValuePipeModule } from '../../../pipes/format-value/format-value.pipe.module';

import { EthereumService } from '../../../services/ethereum/ethereum.service';
import { EthereumServiceMock } from '../../../services/ethereum/ethereum.service.mock';
import { StakingService } from '../../../services/staking/staking.service';
import { StakingServiceMock } from '../../../services/staking/staking.service.mock';

import { UnstakeComponent } from './unstake.component';

describe('UnstakeComponent', async () => {
    let fixture: ComponentFixture<UnstakeComponent>;
    let component: UnstakeComponent;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [UnstakeComponent],
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
                        provide: StakingService,
                        useClass: StakingServiceMock,
                    },
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(UnstakeComponent);
        component = fixture.debugElement.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });
});
