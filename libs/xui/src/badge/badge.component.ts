import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BadgeColor } from './badge.types';

@Component({
  selector: 'xui-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div [ngClass]="styles"><ng-content></ng-content></div>`
})
export class BadgeComponent {
  @Input() color?: BadgeColor;

  get styles() {
    // const config = this.configService.getConfigForComponent(BUTTON_MODULE);
    const ret: { [klass: string]: boolean } = {
      'x-badge': true
    };

    ret[`x-badge-${this.color ?? 'primary'}`] = true;

    return ret;
  }
}
