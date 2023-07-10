import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { InputNumber } from '../utils';
import { DecagramColor, DecagramType } from './decagram.types';
import { CommonModule } from '@angular/common';
import { XuiIconComponent } from '../icon';
import { NumberInput } from '@angular/cdk/coercion';

@Component({
  standalone: true,
  imports: [CommonModule, XuiIconComponent],
  selector: 'xui-decagram',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <xui-icon [ngClass]="style">{{ this.type }}</xui-icon>
    <xui-icon [style.width.%]="iconSize" [ngClass]="iconStyle"><ng-content></ng-content></xui-icon>
  `
})
export class XuiDecagramComponent {
  @Input() @InputNumber() iconSize: NumberInput = 65;
  @Input() type: DecagramType = 'decagram';
  @Input() color: DecagramColor = 'primary';

  get style() {
    return `x-decagram-${this.color}`;
  }

  get iconStyle() {
    const ret: { [klass: string]: boolean } = {
      'x-decagram-icon': true
    };

    ret[`x-decagram-${this.type}`] = true;
    return ret;
  }
}
