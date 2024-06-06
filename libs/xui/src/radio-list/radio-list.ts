import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  effect,
  input,
  Optional,
  QueryList,
  Self,
  signal
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import {
  RADIO_LIST_ACCESSOR,
  RadioListAccessor,
  RadioListColor,
  RadioListSize,
  RadioListValue
} from './radio-list.types';
import { convertToBoolean } from '../utils';
import { XuiRadioOption } from './radio-option';

@Component({
  selector: 'xui-radio-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  providers: [{ provide: RADIO_LIST_ACCESSOR, useExisting: XuiRadioList }],
  host: {
    class: 'x-radio-list',
    '[tabindex]': '_disabled() ? -1 : 0',
    '(keydown.arrowup)': '_prev($event)',
    '(keydown.arrowdown)': '_next($event)',
    '(mousedown)': '_mouseDown = true',
    '(mouseup)': '_mouseDown = false',
    '(focusin)': '_focusIn()',
    '(focusout)': '_focusOut()'
  }
})
export class XuiRadioList implements RadioListAccessor, ControlValueAccessor {
  private onChange?: (source: RadioListValue) => void;
  private onTouched?: () => void;
  _mouseDown = false;

  _value = signal<RadioListValue>(null);
  _disabled = signal(false);
  _focusedValue = signal<RadioListValue>(null);

  value = input<RadioListValue>();
  size = input<RadioListSize>('md');
  color = input<RadioListColor>('light');
  disabled = input<boolean | undefined, string | boolean>(undefined, {
    transform: (v: string | boolean) => convertToBoolean(v)
  });

  @ContentChildren(XuiRadioOption) private optionsRef!: QueryList<XuiRadioOption>;

  constructor(@Self() @Optional() public control?: NgControl) {
    if (this.control) {
      this.control.valueAccessor = this;
    }

    effect(() => this.disabled() && this._disabled.set(this.disabled()!), { allowSignalWrites: true });
    effect(() => this.value() && this._value.set(this.value()!), { allowSignalWrites: true });
    effect(() => this.onChange?.(this._value()));
  }

  writeValue(source: RadioListValue) {
    this._value.set(source);
  }

  registerOnChange(onChange: (source: RadioListValue) => void) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void) {
    this.onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled.set(isDisabled);
  }

  _prev(event: KeyboardEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.select(true);
  }

  _next(event: KeyboardEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.select(false);
  }

  _focusIn() {
    if (!this._mouseDown) {
      if (this._value() == null) {
        this.select(false);
      } else {
        this._focusedValue.set(this._value());
      }
    }
  }

  _focusOut() {
    this._focusedValue.set(null);
    this.onTouched?.();
  }

  private select(backwards: boolean) {
    if (this._disabled()) {
      return;
    }

    const options = this.optionsRef.toArray();
    let next = options.findIndex(x => x.value() == this._value());
    let iterations = options.length;

    do {
      next += backwards ? options.length - 1 : 1;
      next %= options.length;

      if (!iterations--) {
        throw 'No enabled options';
      }
    } while (options[next].disabled());

    this._value.set(options[next].value());
    this._focusedValue.set(this._value());
  }
}
