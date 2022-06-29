import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { first, skip } from 'rxjs/operators';

import { ConfigurationService } from '../../services/configuration/configuration.service';
import { FoldingService } from '../../services/folding/folding.service';

@Component({
    selector: 'app-root',
    templateUrl: './root.component.html',
})
export class RootComponent {
    constructor(
        private router: Router,
        private configurationService: ConfigurationService,
        public foldingService: FoldingService,
    ) {
        this.configurationService
            .getConfig('navigation')
            .subscribe((navigation) => {
                if (navigation === 'old') {
                    this.router.navigate(['home']);
                } else {
                    this.foldingService.positions$
                        .pipe(skip(1), first())
                        .subscribe((positions) =>
                            this.router.navigate([
                                positions.length ? 'positions' : 'trading',
                            ]),
                        );
                }
            });
    }
}
