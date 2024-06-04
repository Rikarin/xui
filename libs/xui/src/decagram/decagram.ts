import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostBinding,
  input,
  Input,
  numberAttribute
} from '@angular/core';
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
    <xui-icon [ngClass]="_style()" fontSet="filled" [icon]="_getIcon()"></xui-icon>
    <xui-icon [style.transform]="_scale()" [ngClass]="_iconStyle()" [icon]="icon()"></xui-icon>
  `
})
export class XuiDecagram {
  iconSize = input<number>(65);
  icon = input.required<string>();
  type = input<DecagramType>('decagram');
  color = input<DecagramColor>('primary');

  _scale = computed(() => `scale(${this.iconSize() / 100})`);

  _getIcon = computed(() => {
    switch (this.type()) {
      case 'decagram':
        return 'brightness_empty';
      case 'circle':
        return 'circle';
      case 'shield':
        return 'shield';
      case 'triangle':
        return 'change_history';
    }
  });

  _style = computed(() => `x-decagram-${this.color()}`);

  _iconStyle = computed(() => {
    const ret: { [klass: string]: boolean } = {
      'x-decagram-icon': true
    };

    ret[`x-decagram-${this.type()}`] = true;
    return ret;
  });

  @HostBinding('class.x-decagram')
  get hostMainClass(): boolean {
    return true;
  }
}
