import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NftComponent } from './nft.component';

const routes: Routes = [
    {
        path: '',
        component: NftComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class NftRoutesModule {}
