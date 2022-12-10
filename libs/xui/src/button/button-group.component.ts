import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ButtonColor, ButtonSize, ButtonType } from './button.types';

@Component({
  selector: 'xui-button-group',
  exportAs: 'xuiButtonGroup',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>'
})
export class XuiButtonGroupComponent {
  @Input() type?: ButtonType;
  @Input() size?: ButtonSize;
  @Input() color?: ButtonColor;
}
