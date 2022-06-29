import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { MAT_INPUT_VALUE_ACCESSOR } from '@angular/material/input';

@Directive({
    selector: 'input[matInputFormatted]',
    providers: [
        {
            provide: MAT_INPUT_VALUE_ACCESSOR,
            useExisting: MatInputFormattedDirective,
        },
    ],
})
export class MatInputFormattedDirective {
    private _value: string | null;

    constructor(private elementRef: ElementRef<HTMLInputElement>) {}

    get value(): string | null {
        return this._value;
    }

    @Input('value')
    set value(value: string | null) {
        this._value = value;
        this.formatValue(value);
    }

    private formatValue(value: string | null) {
        if (value !== null) {
            this.elementRef.nativeElement.value =
                MatInputFormattedDirective.numberWithCommas(value);
        } else {
            this.elementRef.nativeElement.value = '';
        }
    }

    private unFormatValue() {
        const value = this.elementRef.nativeElement.value;
        this._value = value.replace(/[^\d.-]/g, '');
        if (value) {
            this.elementRef.nativeElement.value = this._value;
        } else {
            this.elementRef.nativeElement.value = '';
        }
    }

    private static numberWithCommas(number): string {
        return number
            .toString()
            .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
    }

    private static onlyNumbersReplace(value: string): string {
        const replacer = (m) => '.' + m.replace(/\./g, '');
        return value.replace(/[^\d.]/g, '').replace(/\.([.\d]+)$/, replacer);
    }

    @HostListener('input', ['$event'])
    onInput(event: InputEvent) {
        const initVal = this.elementRef.nativeElement.value;
        const numVal = MatInputFormattedDirective.onlyNumbersReplace(initVal);
        this.elementRef.nativeElement.value = numVal;
        if (initVal !== this.elementRef.nativeElement.value) {
            event.stopPropagation();
        }
        this._value = numVal;
    }

    @HostListener('blur')
    _onBlur() {
        this.formatValue(this._value);
    }

    @HostListener('focus')
    onFocus() {
        this.unFormatValue();
    }
}
