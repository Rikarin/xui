import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, Optional, Self } from '@angular/core';
import { RadioColor, RadioItem, RadioValue } from './radio.types';
import { Subject } from 'rxjs';
import { InputBoolean } from '../utils';
import { BooleanInput } from '@angular/cdk/coercion';
import { NgControl } from '@angular/forms';

@Component({
  selector: 'xui-radio-group',
  templateUrl: './radio-group.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadioGroupComponent {
  static ngAcceptInputType_disabled: BooleanInput;

  private onChange?: (source: RadioValue) => void;
  private onTouched?: () => void;
  private _value: RadioValue = null;

  onChange$ = new Subject();

  @Input() @InputBoolean() disabled = false;
  @Input() color: RadioColor = 'none';
  @Input() items?: RadioItem[];

  @Input()
  get value() {
    return this._value;
  }

  set value(v) {
    if (this._value !== v) {
      this._value = v;
      this.onChange?.(v);
      this.onChange$.next(null);
    }
  }

  constructor(private changeDetectorRef: ChangeDetectorRef, @Self() @Optional() public control?: NgControl) {
    if (this.control) {
      this.control.valueAccessor = this;
    }
  }

  ngOnInit() {
    this.control?.statusChanges?.subscribe(() => {
      this.changeDetectorRef.markForCheck();
    });
  }

  writeValue(source: string) {
    this.value = source;
  }

  registerOnChange(onChange: (source: RadioValue) => void) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void) {
    this.onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
