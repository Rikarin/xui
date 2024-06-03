import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { InputNumber } from '../utils';
import { DecagramColor, DecagramType } from './decagram.types';
import { CommonModule } from '@angular/common';
import { XuiIcon } from '../icon';
import { NumberInput } from '@angular/cdk/coercion';

@Component({
  standalone: true,
  imports: [CommonModule, XuiIcon],
  selector: 'xui-decagram',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <xui-icon [ngClass]="style">{{ this.type }}</xui-icon>
    <xui-icon [style.width.%]="iconSize" [ngClass]="iconStyle"><ng-content /></xui-icon>
  `
})
export class XuiDecagram {
  @Input() @InputNumber() iconSize: NumberInput = 65;
  @Input() type: DecagramType = 'decagram';
  @Input() color: DecagramColor = 'primary';

  @HostBinding('class.x-decagram')
  get hostMainClass(): boolean {
    return true;
  }

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
