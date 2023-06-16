import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BadgeColor } from './badge.types';
import { BADGE_MODULE, WithConfig, XuiConfigService } from '../config';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'xui-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div [ngClass]="styles"><ng-content></ng-content></div>`
})
export class XuiBadgeComponent {
  private readonly _moduleName = BADGE_MODULE;

  @Input() @WithConfig() color: BadgeColor = 'primary';

  get styles() {
    const ret: { [klass: string]: boolean } = {
      'x-badge': true
    };

    ret[`x-badge-${this.color}`] = true;

    return ret;
  }

  constructor(private configService: XuiConfigService) {}
}
