import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';

import { MarketsService } from '../../services/markets/markets.service';
import { MarketsServiceMock } from '../../services/markets/markets.service.mock';

import { FormatValuePipeModule } from '../../pipes/format-value/format-value.pipe.module';

import { TooltipComponent } from './tooltip.component';

describe('TooltipComponent', async () => {
    let fixture: ComponentFixture<TooltipComponent>;
    let component: TooltipComponent;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [TooltipComponent],
                imports: [FormatValuePipeModule],
                providers: [
                    {
                        provide: MarketsService,
                        useClass: MarketsServiceMock,
                    },
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(TooltipComponent);
        component = fixture.debugElement.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });
});
