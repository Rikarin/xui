import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ButtonColor, ButtonSize, ButtonType } from './button.types';

@Component({
  selector: 'xui-button-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  host: {
    class: 'x-button-group'
  }
})
export class XuiButtonGroup {
  type = input<ButtonType>();
  size = input<ButtonSize>();
  color = input<ButtonColor>();
}
