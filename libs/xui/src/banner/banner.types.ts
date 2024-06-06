import { InjectionToken } from '@angular/core';

export type BannerType = 'info' | 'success' | 'warning' | 'alert';

export const XUI_BANNER_DEFAULT_OPTIONS = new InjectionToken<XuiBannerOptions>('XUI_BANNER_DEFAULT_OPTIONS');

export interface XuiBannerOptions {
  type?: BannerType;
  dismissible?: boolean;
}
