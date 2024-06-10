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
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { CheckboxColor } from './checkbox.types';
import { CHECKBOX_MODULE, XuiConfigService } from '../config';
import { CommonModule } from '@angular/common';
import { XuiFocusModule } from '../utils/focus.service';

@Component({
  standalone: true,
  imports: [CommonModule, XuiFocusModule],
  selector: 'xui-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="x-checkbox-box" [tabindex]="_disabled() ? -1 : 0" [class.x-checkbox-checked]="value()">
      <svg
        *ngIf="value()"
        viewBox="0 0 24 24"
        height="100%"
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        focusable="false"
      >
        <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"></path>
      </svg>
    </div>
    <ng-content />`,
  host: {
    class: 'x-checkbox',
    '[class]': '"x-checkbox-" + color()',
    '[class.x-checkbox-disabled]': '_disabled()',
    '(focusout)': '_onTouched?.()',
    '(click)': '_click($event)',
    '(keydown.enter)': '_click($event)',
    '(keydown.space)': '_click($event)'
  }
})
export class XuiCheckbox implements ControlValueAccessor {
  private readonly _moduleName = CHECKBOX_MODULE;

  private onChange?: (source: boolean) => void;
  _onTouched?: () => void;
  _disabled = signal(false);

  color = input<CheckboxColor>('primary');
  value = model<boolean>();
  disabled = input<boolean | undefined, string | boolean>(undefined, {
    transform: booleanAttribute
  });

  constructor(
    private configService: XuiConfigService,
    @Self() @Optional() public control?: NgControl
  ) {
    if (this.control) {
      this.control.valueAccessor = this;
    }

    effect(() => this.disabled() && this._disabled.set(this.disabled()!), { allowSignalWrites: true });
    effect(() => this.onChange?.(this.value()!));
  }

  writeValue(source: boolean) {
    this.value.set(source);
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

  _click(event: KeyboardEvent) {
    event?.preventDefault();

    if (!this._disabled()) {
      this.value.set(!this.value());
    }
  }
}
