import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { HighchartsChartModule } from 'highcharts-angular';

import { GeckoPriceService } from '../../services/gecko-price/gecko-price.service';
import { GeckoPriceServiceMock } from '../../services/gecko-price/gecko-price.service.mock';
import { EthereumService } from '../../services/ethereum/ethereum.service';
import { EthereumServiceMock } from '../../services/ethereum/ethereum.service.mock';

import { FormatValuePipeModule } from '../../pipes/format-value/format-value.pipe.module';

import { AssetGraphComponent } from './asset-graph.component';

describe('AssetGraphComponent', async () => {
    let fixture: ComponentFixture<AssetGraphComponent>;
    let component: AssetGraphComponent;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [AssetGraphComponent],
                imports: [
                    RouterTestingModule.withRoutes([]),
                    HttpClientTestingModule,
                    MatIconModule,
                    FormatValuePipeModule,
                    HighchartsChartModule,
                    MatProgressSpinnerModule,
                ],
                providers: [
                    {
                        provide: GeckoPriceService,
                        useClass: GeckoPriceServiceMock,
                    },
                    {
                        provide: EthereumService,
                        useClass: EthereumServiceMock,
                    },
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(AssetGraphComponent);
        component = fixture.debugElement.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });
});
