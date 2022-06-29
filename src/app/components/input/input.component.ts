import {
    Component,
    EventEmitter,
    forwardRef,
    Input,
    Output,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'app-input',
    templateUrl: './input.component.html',
    styleUrls: ['./input.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputComponent),
            multi: true,
        },
    ],
})
export class InputComponent implements ControlValueAccessor {
    @Output() onIncrease: EventEmitter<any> = new EventEmitter<any>();
    @Output() onDecrease: EventEmitter<any> = new EventEmitter<any>();

    @Input() invalid: boolean = false;
    @Input() disabled?: boolean = false;
    @Input() placeHolder?: string = '';
    @Input() name?: string = '';

    private _value: number;
    private _onChange = (value: number) => {};
    private _onTouched = () => {};

    public get value(): number {
        return this._value;
    }

    public set value(value: number) {
        /**
         * 'Cause we're using an input of type text
         * than we need to convert our value to number type
         */
        if (typeof value === 'string') {
            value = this.toNumber(value as string);
        }
        this._value = value;
        this._onChange(this._value);
        this._onTouched();
    }

    private toNumber(value: string): number {
        const num = +value.replace(/[^\d.-]/g, '');
        return !isNaN(num) ? num : 0;
    }

    handleOnIncrease(): void {
        this.onIncrease.emit();
    }

    handleOnDecrease(): void {
        this.onDecrease.emit();
    }

    writeValue(value: any) {
        this._value = value;
    }

    registerOnChange(fn: (value: any) => void) {
        this._onChange = fn;
    }

    registerOnTouched(fn: () => void) {
        this._onTouched = fn;
    }
}
