import {
    MatSnackBarModule,
    MatSnackBarRef,
    MAT_SNACK_BAR_DATA,
} from '@angular/material/snack-bar';
import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';

import { MarketsService } from '../../services/markets/markets.service';
import { MarketsServiceMock } from '../../services/markets/markets.service.mock';

import { FormatValuePipeModule } from '../../pipes/format-value/format-value.pipe.module';

import { ErrorSnackBarComponent } from './error-snack-bar.component';

describe('ErrorSnackBarComponent', async () => {
    let fixture: ComponentFixture<ErrorSnackBarComponent>;
    let component: ErrorSnackBarComponent;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [ErrorSnackBarComponent],
                imports: [FormatValuePipeModule, MatSnackBarModule],
                providers: [
                    {
                        provide: MatSnackBarRef,
                        useValue: {},
                    },
                    {
                        provide: MAT_SNACK_BAR_DATA,
                        useValue: {},
                    },
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(ErrorSnackBarComponent);
        component = fixture.debugElement.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });
});
