import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { Observable, from, combineLatest } from 'rxjs';
import { first, map, distinctUntilChanged, filter } from 'rxjs/operators';

import * as Highcharts from 'highcharts/highstock';

import { EthereumService } from './../../services/ethereum/ethereum.service';
import { GeckoPriceService } from './../../services/gecko-price/gecko-price.service';

import {
    CHART_PRIMARY_COLOR,
    CHART_SECONDARY_COLOR,
    CHART_TOOLTIP_LINE_HEIGHT,
    CHART_TEXT_COLOR,
    CHART_BUTTON_COLOR,
    CHART_STOPS_0,
    CHART_STOPS_1,
    CHART_BG,
    CHART_FONT_FAMILY,
    CHART_TOOLTIP_FONT_SIZE,
} from './../../constants/commons';

import { ISegment } from './../../interfaces/segment.interface';
import { IPosition } from './../../interfaces/position.interface';
import { formatExchangeRate } from 'src/app/utilities/format-exchange-rate';

@Component({
    selector: 'app-asset-graph',
    templateUrl: './asset-graph.component.html',
})
export class AssetGraphComponent implements OnChanges {
    @Input() position: IPosition;
    @Input() strategy: string;

    Highcharts: typeof Highcharts = Highcharts;
    chartOptions: Highcharts.Options;
    types: ISegment[] = [];
    currentSegment: ISegment;
    asset$: Observable<any>;
    filterDays = '30';

    constructor(
        private geckoService: GeckoPriceService,
        private ethereumService: EthereumService,
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (
            changes.position.currentValue.borrowMarket?.assetAddress !==
                changes.position.previousValue?.borrowMarket?.assetAddress ||
            changes.position.currentValue.supplyMarket?.assetAddress !==
                changes.position.previousValue?.supplyMarket?.assetAddress
        ) {
            const position = changes.position.currentValue as IPosition;

            this.updateAsset(position);
        }
    }

    updateAsset(position: IPosition): void {
        this.types = [];

        if (
            position?.borrowMarket &&
            position?.borrowMarket.assetAddress !==
                position.supplyMarket.assetAddress
        ) {
            const id = this.getCoinId(position.borrowMarket.assetAddress);

            if (id) {
                this.types.unshift({
                    id,
                    name: position.borrowMarket.assetSymbol,
                    assetAddress: position.borrowMarket.assetAddress,
                    title: `Price ${position.borrowMarket.assetSymbol}`,
                    platform: position.borrowMarket.platform,
                });
            }
        }

        if (position.supplyMarket) {
            const id = this.getCoinId(position.supplyMarket.assetAddress);

            if (id) {
                const segment = {
                    id,
                    name: position.supplyMarket.assetSymbol,
                    assetAddress: position.supplyMarket.assetAddress,
                    title: `Price ${position.supplyMarket.assetSymbol}`,
                    platform: position.supplyMarket.platform,
                };

                this.filterDays = '30';
                this.types.unshift(segment);
                this.updateGraph(segment, this.filterDays);
            }
        }
    }

    updateGraph(segment: ISegment, days: string): void {
        // Show Graph in exchange rate between supply/borrow
        const borrowID = this.types[1] ? this.types[1].id : this.types[0].id;

        combineLatest([
            this.geckoService.getMarketChart(this.types[0].id, days),
            this.geckoService.getMarketChart(borrowID, days),
        ])
            .pipe(
                distinctUntilChanged(),
                first(),
                filter(([supplyData, borrowData]) => {
                    return supplyData.length === borrowData.length
                        ? [supplyData === borrowData]
                        : supplyData.length > borrowData.length
                        ? supplyData.pop()
                        : borrowData.pop();
                }),
                map(([supplyData, borrowData]) => {
                    return supplyData.map((supplyValue, i) => {
                        const borrow = borrowData.find((_, inx) => inx === i);

                        return [supplyValue[0], borrow[1] / supplyValue[1]];
                    });
                }),
            )
            .subscribe((data) => this.drawChart(data));

        this.asset$ = combineLatest([
            from(this.geckoService.getCoin(segment.id)).pipe(first()),
            from(this.geckoService.getCoin(borrowID)).pipe(first()),
        ]).pipe(
            map(([asset, borrowAsset]) => {
                const current_price =
                    asset.market_data.current_price.usd /
                    borrowAsset.market_data.current_price.usd;

                return {
                    ...asset,
                    current_price,
                    asset_address: segment.assetAddress,
                    asset_platform: segment.platform,
                };
            }),
        );

        this.currentSegment = segment;
    }

    onChangeGraph(segment): void {
        this.currentSegment = segment;

        this.asset$ = from(this.geckoService.getCoin(segment.id)).pipe(
            first(),
            map((asset) => {
                return {
                    ...asset,
                    asset_address: segment.assetAddress,
                    asset_platform: segment.platform,
                };
            }),
        );
    }

    filterChartData(days: string): void {
        this.filterDays = days;
        this.updateGraph(this.currentSegment, days);
    }

    drawChart(data: number[]): void {
        const self = this;

        this.chartOptions = {
            chart: {
                backgroundColor: 'transparent',
            },
            rangeSelector: {
                allButtonsEnabled: false,
                inputEnabled: false,
                enabled: false,
                buttonPosition: {
                    align: 'right',
                },
                labelStyle: {
                    display: 'none',
                },
                buttonTheme: {
                    display: 'none',
                    fill: 'none',
                    stroke: 'none',
                    'margin-top': '-50px !important',
                    'stroke-width': 0,
                    r: '20px',
                    style: {
                        color: CHART_BUTTON_COLOR,
                        fontWeight: 'bold',
                        padding: '12px',
                        fontSize: '15px',
                    },
                    states: {
                        hover: {
                            fill: 'transparent',
                            style: {
                                color: CHART_TEXT_COLOR,
                            },
                        },
                        select: {
                            fill: 'transparent',
                            style: {
                                color: CHART_TEXT_COLOR,
                            },
                        },
                    },
                },
            },
            credits: {
                enabled: false,
            },
            title: {
                text: '',
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    day: '%b-%d',
                    month: '%b-%d',
                },
                lineWidth: 0,
                minorGridLineWidth: 0,
                minorTickLength: 0,
                tickLength: 0,
                labels: {
                    style: {
                        color: CHART_SECONDARY_COLOR,
                        fontFamily: CHART_FONT_FAMILY,
                    },
                },
            },
            yAxis: {
                visible: false,
            },
            navigator: {
                enabled: false,
            },
            scrollbar: {
                enabled: false,
            },
            tooltip: {
                backgroundColor: CHART_BG,
                borderColor: 'transparent',
                style: {
                    color: '#fff',
                    fontFamily: CHART_FONT_FAMILY,
                    fontSize: CHART_TOOLTIP_FONT_SIZE,
                    'line-height': CHART_TOOLTIP_LINE_HEIGHT,
                },
                pointFormatter: function () {
                    let label;

                    if (self.position.borrowMarket) {
                        label = `${self.position.supplyMarket.assetSymbol}/${self.position.borrowMarket.assetSymbol}`;
                    } else {
                        label = `${self.position.supplyMarket.assetSymbol}`;
                    }

                    return `<span style="color:${CHART_TEXT_COLOR}">${formatExchangeRate(
                        this.y,
                        self.position.supplyMarket.assetSymbol,
                        self.position.borrowMarket.assetSymbol,
                    )}</span>`;
                },
                shared: true,
            },
            series: [
                {
                    type: 'area',
                    data,
                    showInLegend: false,
                    lineColor: CHART_PRIMARY_COLOR,
                    lineWidth: 2,
                    showInNavigator: false,
                },
            ],
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1,
                        },
                        stops: [
                            [0, CHART_STOPS_0],
                            [1, CHART_STOPS_1],
                        ],
                    },
                    marker: {
                        radius: 2,
                    },
                    lineWidth: 1,
                    states: {
                        hover: {
                            lineWidth: 1,
                        },
                    },
                    threshold: null,
                },
            },
        };
    }

    getCoinId(address: string): string {
        const assets = this.ethereumService.getNetworkAssets();

        return assets.find(
            (a) => a.address.toLowerCase() === address.toLowerCase(),
        )?.id;
    }
}
