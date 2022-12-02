import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { InputNumber } from '../utils';
import { DecagramColor, DecagramType } from './decagram.types';

@Component({
  selector: 'xui-decagram',
  exportAs: 'xuiDecagram',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <xui-icon [class]="style">{{ this.type }}</xui-icon>
    <xui-icon [style.width.%]="iconSize" class="x-decagram-icon"><ng-content></ng-content></xui-icon>
  `
})
export class XuiDecagramComponent {
  @Input() @InputNumber() iconSize = 65;
  @Input() type: DecagramType = 'decagram';
  @Input() color: DecagramColor = 'primary';

  get style() {
    return `x-decagram-${this.color}`;
  }
}
