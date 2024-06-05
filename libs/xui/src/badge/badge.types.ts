import { InjectionToken } from '@angular/core';

export type BadgeColor = 'primary' | 'primary-alt' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

export const XUI_BADGE_DEFAULT_OPTIONS = new InjectionToken<XuiBadgeOptions>('XUI_BADGE_DEFAULT_OPTIONS');

export interface XuiBadgeOptions {
  color?: BadgeColor;
}
