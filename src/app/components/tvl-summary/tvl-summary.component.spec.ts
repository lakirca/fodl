import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { EthereumService } from '../../services/ethereum/ethereum.service';
import { EthereumServiceMock } from '../../services/ethereum/ethereum.service.mock';
import { LPService } from '../../services/lp/lp.service';
import { LPServiceMock } from '../../services/lp/lp.service.mock';
import { MarketsService } from '../../services/markets/markets.service';
import { MarketsServiceMock } from '../../services/markets/markets.service.mock';
import { SingleSidedStakingService } from '../../services/single-sided-staking/single-sided-staking.service';
import { SingleSidedStakingServiceMock } from '../../services/single-sided-staking/single-sided-staking.service.mock';
import { TvlService } from '../../services/tvl/tvl.service';
import { TvlServiceMock } from '../../services/tvl/tvl.service.mock';

import { FormatValuePipeModule } from '../../pipes/format-value/format-value.pipe.module';

import { TvlSummaryComponent } from './tvl-summary.component';

describe('TvlSummaryComponent', async () => {
    let fixture: ComponentFixture<TvlSummaryComponent>;
    let component: TvlSummaryComponent;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [TvlSummaryComponent],
                imports: [MatProgressSpinnerModule, FormatValuePipeModule],
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
                        provide: MarketsService,
                        useClass: MarketsServiceMock,
                    },
                    {
                        provide: SingleSidedStakingService,
                        useClass: SingleSidedStakingServiceMock,
                    },
                    {
                        provide: TvlService,
                        useClass: TvlServiceMock,
                    },
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(TvlSummaryComponent);
        component = fixture.debugElement.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });
});
