import { Pipe, PipeTransform } from '@angular/core';

import { formatExchangeRate } from '../../utilities/format-exchange-rate';

@Pipe({
    name: 'formatExchangeRate',
})
export class FormatExchangeRatePipe implements PipeTransform {
    transform(
        amount: number,
        sourceAsset: string,
        destintionAsset: string,
        format?: string,
    ): any {
        return formatExchangeRate(amount, sourceAsset, destintionAsset, format);
    }
}
