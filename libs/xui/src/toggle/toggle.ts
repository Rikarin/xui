import { ChangeDetectionStrategy, Component, effect, input, Optional, Self, signal } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { convertToBoolean } from '../utils';
import { ToggleColor } from './toggle.types';
import { CommonModule } from '@angular/common';
import { XuiIcon } from '../icon';
import { XuiFocusModule } from '../utils/focus.service';

@Component({
  standalone: true,
  imports: [CommonModule, XuiIcon, XuiFocusModule],
  selector: 'xui-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div [class.x-toggle-clip]="!_value()">
      <div class="x-toggle-content">
        <xui-icon [icon]="icon()"></xui-icon>
      </div>
    </div>
    <div [class.x-toggle-toggled]="!_value()">
      <div class="x-toggle-line"></div>
    </div>`,
  host: {
    class: 'x-toggle',
    '[class]': 'color() !== "none" ? "x-toggle-" + color() : ""',
    '[class.x-toggle-disabled]': '_disabled()',
    '[tabindex]': '_disabled() ? -1 : 0',
    '(focusout)': '_onTouched?.()',
    '(click)': '_click($event)',
    '(keydown.enter)': '_click($event)',
    '(keydown.space)': '_click($event)'
  }
})
export class XuiToggle implements ControlValueAccessor {
  private onChange?: (source: boolean) => void;
  _onTouched?: () => void;
  _disabled = signal(false);
  _value = signal(true);

  value = input<boolean | undefined, string | boolean>(undefined, {
    transform: (v: string | boolean) => convertToBoolean(v)
  });
  color = input<ToggleColor>('none');
  icon = input<string>();
  disabled = input<boolean | undefined, string | boolean>(undefined, {
    transform: (v: string | boolean) => convertToBoolean(v)
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
