import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-tooltip',
    templateUrl: './tooltip.component.html',
})
export class TooltipComponent {
    @Input() header: string;
    @Input() text: string;
}
