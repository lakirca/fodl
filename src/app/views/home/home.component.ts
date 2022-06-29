import { Component } from '@angular/core';

import { FoldingService } from '../../services/folding/folding.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
})
export class HomeComponent {
    constructor(public foldingService: FoldingService) {}
}
