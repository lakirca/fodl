import { Component, EventEmitter, Input, Output } from '@angular/core';

import { TOOLTIP } from '../../constants/tooltip-text';

import { IPosition } from './../../interfaces/position.interface';

import { FoldingService } from '../../services/folding/folding.service';

@Component({
    selector: 'app-leverage-slider',
    templateUrl: './leverage-slider.component.html',
})
export class LeverageSliderComponent {
    @Output() leverageChange: EventEmitter<any> = new EventEmitter<any>();
    @Output() simulate: EventEmitter<any> = new EventEmitter<any>();

    @Input() position: IPosition;
    @Input() maxLeverage: number;
    @Input() strategy: string;
    @Input() leverage: number;

    tooltip = TOOLTIP;

    constructor(private foldingService: FoldingService) {}

    onLeverageChange(leverage) {
        if (this.strategy) {
            this.leverageChange.emit(leverage);
        } else {
            const body = {
                leverage,
            };
            this.simulate.emit(body);
        }
    }
}
