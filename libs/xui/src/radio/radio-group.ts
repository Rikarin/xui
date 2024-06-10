import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  model,
  Optional,
  Self,
  signal
} from '@angular/core';
import { RADIO_GROUP_ACCESSOR, RadioColor, RadioGroupAccessor, RadioItem, RadioValue } from './radio.types';
import { ControlValueAccessor, NgControl } from '@angular/forms';

@Component({
  selector: 'xui-radio-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: RADIO_GROUP_ACCESSOR, useExisting: XuiRadioGroup }],
  template: `
    <ng-content select="xui-radio" />
    @for (item of items(); track item.value) {
      <xui-radio [value]="item.value">{{ item.label | translate }}</xui-radio>
    }
  `,
  host: {
    class: 'x-radio-group'
  }
})
export class XuiRadioGroup implements RadioGroupAccessor, ControlValueAccessor {
  private onChange?: (source: RadioValue) => void;
  private onTouched?: () => void;

  _disabled = signal(false);

  value = model<RadioValue>(null);
  color = input<RadioColor>('none');
  items = input<RadioItem[]>();
  disabled = input<boolean | undefined, string | boolean>(undefined, {
    transform: booleanAttribute
  });

  constructor(@Self() @Optional() public control?: NgControl) {
    if (this.control) {
      this.control.valueAccessor = this;
    }

    effect(() => this.disabled() && this._disabled.set(this.disabled()!), { allowSignalWrites: true });
    effect(() => this.onChange?.(this.value()!));
  }

  writeValue(source: RadioValue) {
    this.value.set(source);
  }

  registerOnChange(onChange: (source: RadioValue) => void) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void) {
    this.onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled.set(isDisabled);
  }
}
