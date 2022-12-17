import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  OnInit,
  Optional,
  Self
} from '@angular/core';
import { InputBoolean } from '../utils';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { SwitchColor } from './switch.types';
import { BooleanInput } from '@angular/cdk/coercion';

@Component({
  selector: 'xui-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './switch.component.html'
})
export class SwitchComponent implements ControlValueAccessor, OnInit {
  static ngAcceptInputType_disabled: BooleanInput;
  static ngAcceptInputType_value: BooleanInput;

  private onChange?: (source: boolean) => void;
  private onTouched?: () => void;
  private _value = false;

  @Input() @InputBoolean() disabled = false;
  @Input() color: SwitchColor = 'success';

  @Input()
  @InputBoolean()
  get value() {
    return this._value;
  }

  set value(v) {
    if (this._value !== v) {
      this._value = v;
      this.onChange?.(v);
    }
  }

  get style() {
    return {
      'x-switch': true,
      'x-switch-disabled': this.disabled
    };
  }

  get styleSwitch() {
    const ret: { [klass: string]: boolean } = {
      'x-switch-element': true,
      'x-switch-toggled': this.value
    };

    ret[`x-switch-${this.color}`] = this.value;
    return ret;
  }

  constructor(private changeDetectorRef: ChangeDetectorRef, @Self() @Optional() public control?: NgControl) {
    if (this.control) {
      this.control.valueAccessor = this;
    }
  }

  ngOnInit() {
    this.control?.statusChanges?.subscribe(() => this.changeDetectorRef.markForCheck());
  }

  writeValue(source: boolean) {
    this.value = source;
  }

  registerOnChange(onChange: (source: boolean) => void) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void) {
    this.onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  @HostListener('focusout')
  private _focusOut() {
    this.onTouched?.();
  }

  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  _click(event?: KeyboardEvent | MouseEvent) {
    event?.preventDefault();

    if (!this.disabled) {
      this.value = !this.value;
    }
  }
}
