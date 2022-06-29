import { Component } from '@angular/core';
import { RouterLinkActive } from '@angular/router';

import { combineLatest } from 'rxjs';

import { ConfigurationService } from '../../services/configuration/configuration.service';

const OLD_NAVIGATION = [
    {
        label: 'Home',
        link: 'home',
    },
    {
        label: 'Staking',
        link: 'staking',
    },
    {
        label: 'Rewards',
        link: 'rewards',
    },
    {
        label: 'NFT Competition',
        link: 'nft',
    },
];

const NEW_NAVIGATION = [
    {
        label: 'Your Positions',
        link: 'positions',
    },
    {
        label: 'Trading',
        link: 'trading',
    },
    {
        label: 'Rewards',
        link: 'rewards',
    },
    {
        label: 'Staking',
        link: 'staking',
    },
    {
        label: 'NFT Competition',
        link: 'nft',
    },
];

const HIDDEN_ON_NON_ETHEREUM = ['staking', 'nft'];

@Component({
    selector: 'app-navigation',
    templateUrl: './navigation.component.html',
})
export class NavigationComponent {
    routes = [];

    constructor(private configurationService: ConfigurationService) {
        combineLatest([
            this.configurationService.getConfig('navigation'),
            this.configurationService.getConfig('network'),
        ]).subscribe(
            ([navigation, network]) =>
                (this.routes = (
                    navigation === 'old' ? OLD_NAVIGATION : NEW_NAVIGATION
                ).filter(
                    (route) =>
                        network === 'ethereum' ||
                        !network ||
                        !HIDDEN_ON_NON_ETHEREUM.includes(route.link),
                )),
        );
    }

    linkActive(routerLinkActive: RouterLinkActive) {
        return routerLinkActive.isActive;
    }
}
