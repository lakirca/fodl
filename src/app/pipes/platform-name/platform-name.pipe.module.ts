import { NgModule } from '@angular/core';

import { PlatformNamePipe } from './platform-name.pipe';

@NgModule({
    declarations: [PlatformNamePipe],
    exports: [PlatformNamePipe],
})
export class PlatformNamePipeModule {}
