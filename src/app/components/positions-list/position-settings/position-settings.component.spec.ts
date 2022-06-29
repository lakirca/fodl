import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';

import {
    MatDialogModule,
    MatDialogRef,
    MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ConfigurationService } from '../../../services/configuration/configuration.service';
import { ConfigurationServiceMock } from '../../../services/configuration/configuration.service.mock';

import { PositionSettingsComponent } from './position-settings.component';

describe('PositionSettingsComponent', async () => {
    let fixture: ComponentFixture<PositionSettingsComponent>;
    let component: PositionSettingsComponent;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [PositionSettingsComponent],
                imports: [MatDialogModule, MatProgressSpinnerModule],
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
                        provide: ConfigurationService,
                        useClass: ConfigurationServiceMock,
                    },
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(PositionSettingsComponent);
        component = fixture.debugElement.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });
});
