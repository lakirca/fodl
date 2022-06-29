import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { FormatValuePipeModule } from '../../pipes/format-value/format-value.pipe.module';

import { FoldingService } from '../../services/folding/folding.service';
import { FoldingServiceMock } from '../../services/folding/folding.service.mock';
import { MarketsService } from '../../services/markets/markets.service';
import { MarketsServiceMock } from '../../services/markets/markets.service.mock';

import { ClaimRewardsComponent } from './claim-rewards.component';

describe('ClaimRewardsComponent', async () => {
    let fixture: ComponentFixture<ClaimRewardsComponent>;
    let component: ClaimRewardsComponent;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [ClaimRewardsComponent],
                imports: [
                    MatButtonModule,
                    MatDialogModule,
                    FormatValuePipeModule,
                ],
                providers: [
                    {
                        provide: FoldingService,
                        useClass: FoldingServiceMock,
                    },
                    {
                        provide: MarketsService,
                        useClass: MarketsServiceMock,
                    },
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(ClaimRewardsComponent);
        component = fixture.debugElement.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });
});
