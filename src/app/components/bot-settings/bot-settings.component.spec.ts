import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';

import { MatButtonModule } from '@angular/material/button';
import {
    MatDialogModule,
    MatDialogRef,
    MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';

import { FormatValuePipeModule } from '../../pipes/format-value/format-value.pipe.module';

import { FoldingService } from '../../services/folding/folding.service';
import { FoldingServiceMock } from '../../services/folding/folding.service.mock';

import { DialogModule } from '../dialog/dialog.module';

import { BotSettingsComponent } from './bot-settings.component';

describe('BotSettingsComponent', async () => {
    let fixture: ComponentFixture<BotSettingsComponent>;
    let component: BotSettingsComponent;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [BotSettingsComponent],
                imports: [
                    MatButtonModule,
                    MatDialogModule,
                    MatIconModule,
                    MatSliderModule,
                    FormatValuePipeModule,
                    DialogModule,
                ],
                providers: [
                    {
                        provide: MAT_DIALOG_DATA,
                        useValue: {},
                    },
                    {
                        provide: MatDialogRef,
                        useValue: {},
                    },
                    {
                        provide: FoldingService,
                        useValue: FoldingServiceMock,
                    },
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(BotSettingsComponent);
        component = fixture.debugElement.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });
});
