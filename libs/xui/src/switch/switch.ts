import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  Optional,
  Self,
  signal
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { SwitchColor } from './switch.types';
import { CommonModule } from '@angular/common';
import { XuiIcon } from '../icon';
import { XuiFocusModule } from '../utils/focus.service';

@Component({
  standalone: true,
  imports: [CommonModule, XuiIcon, XuiFocusModule],
  selector: 'xui-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'switch.html',
  host: {
    class: 'x-switch',
    '[class.x-switch--disabled]': '_disabled()',
    '(focusout)': '_onTouched?.()',
    '(keydown.enter)': '_click($event)',
    '(keydown.space)': '_click($event)'
  }
})
export class XuiSwitch implements ControlValueAccessor {
  private onChange?: (source: boolean) => void;
  _onTouched?: () => void;
  _value = signal(false);
  _disabled = signal(false);

  value = input<boolean | undefined, string | boolean>(undefined, {
    transform: booleanAttribute
  });
  color = input<SwitchColor>('success');
  disabled = input<boolean | undefined, string | boolean>(undefined, {
    transform: booleanAttribute
  });

  _styles = computed(() => {
    const ret: { [klass: string]: boolean } = {
      'x-switch-element': true,
      'x-switch-toggled': this._value()
    };

    ret[`x-switch-${this.color()}`] = this._value();
    return ret;
  });

  constructor(@Self() @Optional() public control?: NgControl) {
    if (this.control) {
      this.control.valueAccessor = this;
    }

    effect(() => this.disabled() && this._disabled.set(this.disabled()!), { allowSignalWrites: true });
    effect(() => this.value() && this._value.set(this.value()!), { allowSignalWrites: true });
    effect(() => this.onChange?.(this._value()));
  }

  writeValue(source: boolean) {
    this._value.set(source);
  }

  registerOnChange(onChange: (source: boolean) => void) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void) {
    this._onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled.set(isDisabled);
  }

  _click(event?: KeyboardEvent | MouseEvent) {
    event?.preventDefault();

    if (!this._disabled()) {
      this._value.set(!this._value());
    }
  }
}
