import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { first } from 'rxjs/operators';

import { ISettings } from '../../interfaces/settings.interface';

import { ConfigurationService } from '../configuration/configuration.service';

@Injectable()
export class SettingsService {
    settings$: BehaviorSubject<ISettings> = new BehaviorSubject<ISettings>(
        undefined,
    );

    constructor(private configurationService: ConfigurationService) {
        this.configurationService.reload();

        this.configurationService.config$.pipe(first()).subscribe((config) => {
            this.settings$.next({
                slippage: parseFloat(config.exchangeSlippage),
                longMarketChangeAssumption: parseFloat(
                    config.longMarketChangeAssumption,
                ),
                navigation: config.navigation,
            });
        });
    }

    set(setting: string, value: any) {
        this.settings$.pipe(first()).subscribe((settings) => {
            let newSettings = { ...settings };
            newSettings[setting] = value;

            this.settings$.next(newSettings);
        });
    }

    save() {
        this.settings$.pipe(first()).subscribe((settings) => {
            this.configurationService.setConfig(
                'exchangeSlippage',
                settings.slippage,
            );

            this.configurationService.setConfig(
                'longMarketChangeAssumption',
                settings.longMarketChangeAssumption ||
                    localStorage.getItem('longMarketChangeAssumption'),
            );

            this.configurationService.setConfig(
                'navigation',
                settings.navigation,
            );
        });
    }
}
