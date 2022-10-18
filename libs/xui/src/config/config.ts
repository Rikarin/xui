import { InjectionToken } from '@angular/core';

export interface XuiConfig {
  button?: ButtonConfig;
}

export interface ButtonConfig {
  xStateDelay?: number;
}

export const XUI_CONFIG = new InjectionToken<XuiConfig>('xui-config');
