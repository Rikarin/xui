import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { InputColor } from './input.types';

@Component({
  selector: 'xui-input-addon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />'
})
export class XuiInputAddon {
  @Input() color: InputColor = 'dark';

  @HostBinding('class.x-input-addon')
  get hostMainClass(): boolean {
    return true;
  }

  @HostBinding('class')
  get hostClass(): string {
    return `x-input-addon-${this.color}`;
  }
}
