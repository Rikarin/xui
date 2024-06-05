import { ChangeDetectionStrategy, Component, computed, Inject, input } from '@angular/core';
import { convertToBoolean } from '../utils';
import { RADIO_LIST_ACCESSOR, RadioListAccessor, RadioListValue } from './radio-list.types';

@Component({
  selector: 'xui-radio-option',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<xui-icon [icon]="_icon()"></xui-icon>
    <div class="x-radio-option-content">
      <ng-content />

      <div class="x-radio-option-description">
        <ng-content select="[xuiDescription]" />
      </div>
    </div>`,
  host: {
    class: 'x-radio-option',
    '[class]': '_hostClass()',
    '[class.x-radio-option-focus]': '_isFocused()',
    '[class.x-radio-option-active]': '_isSelected()',
    '[class.x-radio-option-disabled]': '_isDisabled()',
    '(click)': '_click()'
  }
})
export class XuiRadioOption {
  value = input.required<RadioListValue>();
  color = input<string>();
  disabled = input(false, { transform: (v: string | boolean) => convertToBoolean(v) });

  _isSelected = computed(() => this.value() == this.list._value());
  _isFocused = computed(() => this.value() == this.list._focusedValue());
  _isDisabled = computed(() => this.disabled() || this.list._disabled());
  _icon = computed(() => (this._isSelected() ? 'radio_button_checked' : 'radio_button_unchecked'));
  _hostClass = computed(
    () =>
      (this.color() ? 'x-radio-option-' + this.color() : '') +
      ` x-radio-option-background-${this.list.color()} x-radio-option-${this.list.size()}`
  );

  constructor(@Inject(RADIO_LIST_ACCESSOR) private list: RadioListAccessor) {}

  _click() {
    if (!this._isDisabled()) {
      this.list._value.set(this.value());
    }
  }
}
