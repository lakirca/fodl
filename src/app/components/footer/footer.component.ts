import { Component } from '@angular/core';

import { Observable } from 'rxjs';

import { ConfigurationService } from '../../services/configuration/configuration.service';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
    build$: Observable<string>;

    website = 'https://fodl.finance';

    constructor(private configurationService: ConfigurationService) {
        this.build$ = this.configurationService.getConfig('build');
    }
}
