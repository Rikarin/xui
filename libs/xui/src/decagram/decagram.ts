import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DecagramColor, DecagramType } from './decagram.types';
import { CommonModule } from '@angular/common';
import { XuiIcon } from '../icon';

@Component({
  standalone: true,
  imports: [CommonModule, XuiIcon],
  selector: 'xui-decagram',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <xui-icon [ngClass]="_style()" fontSet="filled" [icon]="_getIcon()"></xui-icon>
    <xui-icon [style.transform]="_scale()" [ngClass]="_iconStyle()" [icon]="icon()"></xui-icon>
  `,
  host: {
    class: 'x-decagram'
  }
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
}
