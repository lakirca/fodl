import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { ConfigurationService } from '../../services/configuration/configuration.service';
import { ConfigurationServiceMock } from '../../services/configuration/configuration.service.mock';
import { SettingsService } from '../../services/settings/settings.service';
import { FoldingService } from '../../services/folding/folding.service';
import { FoldingServiceMock } from '../../services/folding/folding.service.mock';

import { LeverageSliderComponent } from './leverage-slider.component';

describe('LeverageSliderComponent', async () => {
    let fixture: ComponentFixture<LeverageSliderComponent>;
    let component: LeverageSliderComponent;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [LeverageSliderComponent],
                imports: [
                    FormsModule,
                    ReactiveFormsModule,
                    MatButtonModule,
                    MatFormFieldModule,
                    MatIconModule,
                    MatInputModule,
                    MatSelectModule,
                ],
                providers: [
                    SettingsService,
                    {
                        provide: FoldingService,
                        useClass: FoldingServiceMock,
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
        fixture = TestBed.createComponent(LeverageSliderComponent);
        component = fixture.debugElement.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });
});
