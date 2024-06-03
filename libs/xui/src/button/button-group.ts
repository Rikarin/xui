import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { ButtonColor, ButtonSize, ButtonType } from './button.types';

@Component({
  selector: 'xui-button-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />'
})
export class XuiButtonGroup {
  @Input() type?: ButtonType;
  @Input() size?: ButtonSize;
  @Input() color?: ButtonColor;

  @HostBinding('class.x-button-group')
  get hostMainClass(): boolean {
    return true;
  }
}
