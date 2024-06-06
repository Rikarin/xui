import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { InputColor } from './input.types';

@Component({
  selector: 'xui-input-addon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  host: {
    class: 'x-input-addon',
    '[class]': '"x-input-addon-" + color()'
  }
})
export class XuiInputAddon {
  color = input<InputColor>('dark');
}
