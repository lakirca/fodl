import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadChildren: () =>
            import('./views/root/root.module').then((m) => m.RootModule),
    },
    {
        path: 'home',
        loadChildren: () =>
            import('./views/home/home.module').then((m) => m.HomeModule),
    },
    {
        path: 'new-position',
        loadChildren: () =>
            import('./views/new-position/new-position.module').then(
                (m) => m.NewPositionModule,
            ),
    },
    {
        path: 'edit-leverage',
        loadChildren: () =>
            import('./views/edit-leverage/edit-leverage.module').then(
                (m) => m.EditLeverageModule,
            ),
    },
    {
        path: 'edit-value',
        loadChildren: () =>
            import('./views/edit-value/edit-value.module').then(
                (m) => m.EditValueModule,
            ),
    },
    {
        path: 'position',
        loadChildren: () =>
            import('./views/view-position/view-position.module').then(
                (m) => m.ViewPositionModule,
            ),
    },
    {
        path: 'positions',
        loadChildren: () =>
            import('./views/positions/positions.module').then(
                (m) => m.PositionsModule,
            ),
    },
    {
        path: 'trading',
        loadChildren: () =>
            import('./views/trading/trading.module').then(
                (m) => m.TradingModule,
            ),
    },
    {
        path: 'staking',
        loadChildren: () =>
            import('./views/staking/staking.module').then(
                (m) => m.StakingModule,
            ),
    },
    {
        path: 'rewards',
        loadChildren: () =>
            import('./views/rewards/rewards.module').then(
                (m) => m.RewardsModule,
            ),
    },
    {
        path: 'nft',
        loadChildren: () =>
            import('./views/nft/nft.module').then((m) => m.NftModule),
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
