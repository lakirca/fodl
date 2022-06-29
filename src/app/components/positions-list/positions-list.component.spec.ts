import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { GaugeModule } from 'angular-gauge';

import { EthereumService } from '../../services/ethereum/ethereum.service';
import { EthereumServiceMock } from '../../services/ethereum/ethereum.service.mock';
import { ERC20Service } from '../../services/erc20/erc20.service';
import { ERC20ServiceMock } from '../../services/erc20/erc20.service.mock';
import { FoldingPositionsService } from '../../services/folding/foldingPositions/foldingPositions.service';
import { FoldingPositionsServiceMock } from '../../services/folding/foldingPositions/foldingPositions.service.mock';
import { FoldingService } from '../../services/folding/folding.service';
import { FoldingServiceMock } from '../../services/folding/folding.service.mock';
import { GeckoPriceService } from '../../services/gecko-price/gecko-price.service';
import { GeckoPriceServiceMock } from '../../services/gecko-price/gecko-price.service.mock';
import { MarketsService } from '../../services/markets/markets.service';
import { MarketsServiceMock } from '../../services/markets/markets.service.mock';

import { AprTooltipModule } from '../apr-tooltip/apr-tooltip.module';
import { IconAssetModule } from '../icon-asset/icon-asset.module';
import { IconPlatformModule } from '../icon-platform/icon-platform.module';
import { IconPairModule } from '../icon-pair/icon-pair.module';

import { PositionSettingsModule } from './position-settings/position-settings.module';

import { PositionsListComponent } from './positions-list.component';

describe('PositionsListComponent', async () => {
    let fixture: ComponentFixture<PositionsListComponent>;
    let component: PositionsListComponent;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [PositionsListComponent],
                imports: [
                    MatButtonModule,
                    MatCheckboxModule,
                    MatDialogModule,
                    MatIconModule,
                    GaugeModule,
                    AprTooltipModule,
                    IconAssetModule,
                    IconPairModule,
                    IconPlatformModule,
                    PositionSettingsModule,
                ],
                providers: [
                    {
                        provide: EthereumService,
                        useClass: EthereumServiceMock,
                    },
                    {
                        provide: ERC20Service,
                        useClass: ERC20ServiceMock,
                    },
                    {
                        provide: FoldingService,
                        useClass: FoldingServiceMock,
                    },
                    {
                        provide: FoldingPositionsService,
                        useClass: FoldingPositionsServiceMock,
                    },
                    {
                        provide: GeckoPriceService,
                        useClass: GeckoPriceServiceMock,
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
        fixture = TestBed.createComponent(PositionsListComponent);
        component = fixture.debugElement.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });
});
