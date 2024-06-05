import { Directive, Inject, Input } from '@angular/core';
import { BadgeColor, XUI_BADGE_DEFAULT_OPTIONS, XuiBadgeOptions } from './badge.types';

@Directive({
  standalone: true,
  selector: '[xuiBadgeConfigure]',
  providers: [{ provide: XUI_BADGE_DEFAULT_OPTIONS, useFactory: () => ({ color: 'primary' }) }]
})
export class XuiBadgeConfigure {
  @Input() set xuiBadgeColor(color: BadgeColor) {
    this.options.color = color;
  }

  constructor(@Inject(XUI_BADGE_DEFAULT_OPTIONS) private options: XuiBadgeOptions) {}
}
