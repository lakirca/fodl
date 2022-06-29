import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { GaugeModule } from 'angular-gauge';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ApiService } from './services/api/api.service';
import { EthereumService } from './services/ethereum/ethereum.service';
import { ERC20Service } from './services/erc20/erc20.service';
import { FoldingMarketsService } from './services/folding/foldingMarkets/foldingMarkets.service';
import { FoldingPositionsService } from './services/folding/foldingPositions/foldingPositions.service';
import { FoldingRegistryService } from './services/folding/foldingRegistry/foldingRegistry.service';
import { FoldingRewardsService } from './services/folding/foldingRewards/foldingRewards.service';
import { FoldingService } from './services/folding/folding.service';
import { GeckoPriceService } from './services/gecko-price/gecko-price.service';
import { SettingsService } from './services/settings/settings.service';

import { BackgroundModule } from './components/background/background.module';
import { FooterModule } from './components/footer/footer.module';
import { HeaderModule } from './components/header/header.module';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { LPService } from './services/lp/lp.service';
import { StakingService } from './services/staking/staking.service';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        GaugeModule.forRoot(),
        MatProgressSpinnerModule,
        AppRoutingModule,
        BackgroundModule,
        FooterModule,
        HeaderModule,
    ],
    providers: [
        ApiService,
        EthereumService,
        ERC20Service,
        FoldingMarketsService,
        FoldingPositionsService,
        FoldingRegistryService,
        FoldingRewardsService,
        FoldingService,
        GeckoPriceService,
        LPService,
        SettingsService,
        StakingService,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
