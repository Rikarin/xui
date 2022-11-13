import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { InputNumber } from '../utils';
import { DecagramColor, DecagramType } from './decagram.types';

@Component({
  selector: 'xui-decagram',
  exportAs: 'xuiDecagram',
  styleUrls: ['decagram.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <xui-icon [class]="style">{{ this.type }}</xui-icon>
    <xui-icon [style.width.%]="iconSize" class="icon"><ng-content></ng-content></xui-icon>
  `
})
export class XuiDecagramComponent {
  @Input() @InputNumber() iconSize: number = 65;
  @Input() type: DecagramType = 'decagram';
  @Input() color: DecagramColor = 'primary';

  get style() {
    return `decagram-color-${this.color}`;
  }
}
