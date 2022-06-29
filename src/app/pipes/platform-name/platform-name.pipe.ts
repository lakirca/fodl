import { Pipe, PipeTransform } from '@angular/core';

import { getPlatformName } from '../../utilities/platform';

@Pipe({
    name: 'platformName',
})
export class PlatformNamePipe implements PipeTransform {
    transform(asset: string): any {
        return getPlatformName(asset);
    }
}
