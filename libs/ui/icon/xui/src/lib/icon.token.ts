import { InjectionToken, ValueProvider, inject } from '@angular/core';
import type { XuiIconSize, XuiIconVariants } from './icon';

/**
 * Application-wide defaults for XuiIcon.
 *
 * Provide it once at the app root to resize or recolour every icon without
 * touching call sites; individual inputs still override the configured value.
 */
export interface XuiIconConfig {
  size: XuiIconSize;
  color: XuiIconVariants['color'];
}

const defaultConfig: XuiIconConfig = {
  size: 'md',
  color: 'inherit'
};

const XuiIconConfigToken = new InjectionToken<XuiIconConfig>('XuiIconConfig');

export function provideXuiIconConfig(config: Partial<XuiIconConfig>): ValueProvider {
  return { provide: XuiIconConfigToken, useValue: { ...defaultConfig, ...config } };
}

export function injectXuiIconConfig(): XuiIconConfig {
  return inject(XuiIconConfigToken, { optional: true }) ?? defaultConfig;
}
