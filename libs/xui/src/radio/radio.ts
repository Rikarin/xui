import { booleanAttribute, ChangeDetectionStrategy, Component, computed, Inject, input } from '@angular/core';
import { RADIO_GROUP_ACCESSOR, RadioColor, RadioGroupAccessor, RadioValue } from './radio.types';

@Component({
  selector: 'xui-radio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<xui-icon [icon]="_selected() ? 'radio_button_checked' : 'radio_button_unchecked'"></xui-icon>
    <ng-content />`,
  host: {
    class: 'x-radio',
    '[class.x-radio-disabled]': '_disabled()',
    '[class]': `"x-radio-" + color() ?? _group.color()`,
    '(click)': '_click()'
  }
})
export class XuiRadio {
  value = input<RadioValue>(null);
  color = input<RadioColor>();
  disabled = input(false, { transform: booleanAttribute });

  _selected = computed(() => this._group.value() === this.value());
  _disabled = computed(() => this.disabled() || this._group._disabled());

  constructor(@Inject(RADIO_GROUP_ACCESSOR) public _group: RadioGroupAccessor) {}

  _click() {
    if (!this._disabled()) {
      this._group.value.set(this.value());
    }
  }
}
