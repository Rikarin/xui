import { InjectionToken, ValueProvider, inject } from '@angular/core';
import type { IconSize } from './icon';

export interface XuiIconConfig {
  size: IconSize;
}

const defaultConfig: XuiIconConfig = {
  size: 'base'
};

const XuiIconConfigToken = new InjectionToken<XuiIconConfig>('XuiIconConfig');

export function provideXuiIconConfig(config: Partial<XuiIconConfig>): ValueProvider {
  return { provide: XuiIconConfigToken, useValue: { ...defaultConfig, ...config } };
}

export function injectXuiIconConfig(): XuiIconConfig {
  return inject(XuiIconConfigToken, { optional: true }) ?? defaultConfig;
}
