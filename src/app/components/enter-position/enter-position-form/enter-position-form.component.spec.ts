import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';

import { FormatValuePipeModule } from '../../../pipes/format-value/format-value.pipe.module';

import { ConfigurationService } from '../../../services/configuration/configuration.service';
import { ConfigurationServiceMock } from '../../../services/configuration/configuration.service.mock';
import { EthereumService } from '../../../services/ethereum/ethereum.service';
import { EthereumServiceMock } from '../../../services/ethereum/ethereum.service.mock';
import { FoldingService } from '../../../services/folding/folding.service';
import { FoldingServiceMock } from '../../../services/folding/folding.service.mock';
import { MarketAssumptionService } from '../../../services/market-assumption/market-assumption.service';
import { MarketsService } from '../../../services/markets/markets.service';
import { MarketsServiceMock } from '../../../services/markets/markets.service.mock';
import { SettingsService } from '../../../services/settings/settings.service';

import { IconAssetModule } from '../../icon-asset/icon-asset.module';
import { AssetSelectModule } from '../../asset-select/asset-select.module';

import { EnterPositionFormComponent } from './enter-position-form.component';

describe('EnterPositionFormComponent', async () => {
    let fixture: ComponentFixture<EnterPositionFormComponent>;
    let component: EnterPositionFormComponent;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [EnterPositionFormComponent],
                imports: [
                    HttpClientTestingModule,
                    FormsModule,
                    FormatValuePipeModule,
                    MatButtonModule,
                    MatDialogModule,
                    MatProgressSpinnerModule,
                    MatSelectModule,
                    MatSliderModule,
                    IconAssetModule,
                    AssetSelectModule,
                ],
                providers: [
                    MarketAssumptionService,
                    SettingsService,
                    {
                        provide: FoldingService,
                        useClass: FoldingServiceMock,
                    },
                    {
                        provide: ConfigurationService,
                        useClass: ConfigurationServiceMock,
                    },
                    {
                        provide: EthereumService,
                        useClass: EthereumServiceMock,
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
        fixture = TestBed.createComponent(EnterPositionFormComponent);
        component = fixture.debugElement.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });
});
