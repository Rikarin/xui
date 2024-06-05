import { ChangeDetectionStrategy, Component, Inject, input, Optional } from '@angular/core';
import { BadgeColor, XUI_BADGE_DEFAULT_OPTIONS, XuiBadgeOptions } from './badge.types';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'xui-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    class: 'x-badge',
    '[class]': '"x-badge-" + color()'
  }
})
export class XuiBadge {
  color = input<BadgeColor>(this.options?.color ?? 'primary');

  constructor(@Optional() @Inject(XUI_BADGE_DEFAULT_OPTIONS) private options?: XuiBadgeOptions) {}
}
