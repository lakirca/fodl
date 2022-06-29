import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { FormatValuePipeModule } from '../../pipes/format-value/format-value.pipe.module';

import { FoldingService } from '../../services/folding/folding.service';
import { FoldingServiceMock } from '../../services/folding/folding.service.mock';
import { MarketsService } from '../../services/markets/markets.service';
import { MarketsServiceMock } from '../../services/markets/markets.service.mock';

import { PositionCloseComponent } from './position-close.component';

describe('PositionCloseComponent', async () => {
    let fixture: ComponentFixture<PositionCloseComponent>;
    let component: PositionCloseComponent;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [PositionCloseComponent],
                imports: [
                    MatButtonModule,
                    MatDialogModule,
                    FormatValuePipeModule,
                    RouterTestingModule.withRoutes([]),
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
        fixture = TestBed.createComponent(PositionCloseComponent);
        component = fixture.debugElement.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });
});
