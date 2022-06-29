import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';

import { FormatValuePipeModule } from '../../../pipes/format-value/format-value.pipe.module';

import { ConfigurationService } from '../../../services/configuration/configuration.service';
import { ConfigurationServiceMock } from '../../../services/configuration/configuration.service.mock';
import { ERC20Service } from '../../../services/erc20/erc20.service';
import { ERC20ServiceMock } from '../../../services/erc20/erc20.service.mock';
import { EthereumService } from '../../../services/ethereum/ethereum.service';
import { EthereumServiceMock } from '../../../services/ethereum/ethereum.service.mock';
import { FoldingService } from '../../../services/folding/folding.service';
import { FoldingServiceMock } from '../../../services/folding/folding.service.mock';
import { FoldingPositionsService } from '../../../services/folding/foldingPositions/foldingPositions.service';
import { FoldingPositionsServiceMock } from '../../../services/folding/foldingPositions/foldingPositions.service.mock';
import { LeverageService } from '../../../services/leverage/leverage.service';
import { MarketsService } from '../../../services/markets/markets.service';
import { MarketsServiceMock } from '../../../services/markets/markets.service.mock';

import { AprTooltipModule } from '../../apr-tooltip/apr-tooltip.module';
import { DialogModule } from '../../dialog/dialog.module';
import { IconAssetModule } from '../../icon-asset/icon-asset.module';

import { PositionCloseModule } from '../../position-close/position-close.module';
import { ClaimRewardsModule } from '../../claim-rewards/claim-rewards.module';

import { PositionFormComponent } from './position-form.component';

describe('PositionFormComponent', async () => {
    let fixture: ComponentFixture<PositionFormComponent>;
    let component: PositionFormComponent;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [PositionFormComponent],
                imports: [
                    HttpClientTestingModule,
                    FormsModule,
                    FormatValuePipeModule,
                    MatButtonModule,
                    MatDialogModule,
                    MatIconModule,
                    MatProgressSpinnerModule,
                    MatSelectModule,
                    MatSliderModule,
                    AprTooltipModule,
                    DialogModule,
                    IconAssetModule,
                    PositionCloseModule,
                    ClaimRewardsModule,
                ],
                providers: [
                    LeverageService,
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
                        provide: ERC20Service,
                        useClass: ERC20ServiceMock,
                    },
                    {
                        provide: FoldingPositionsService,
                        useClass: FoldingPositionsServiceMock,
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
        fixture = TestBed.createComponent(PositionFormComponent);
        component = fixture.debugElement.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });
});
