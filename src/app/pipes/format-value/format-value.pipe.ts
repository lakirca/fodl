import { Pipe, PipeTransform } from '@angular/core';

import { formatValue } from '../../utilities/format-value';

@Pipe({
    name: 'formatValue',
})
export class FormatValuePipe implements PipeTransform {
    transform(value: number | string, symbol = '', precision = -1): string {
        return formatValue(value as number, symbol, precision);
    }
}
