import { InjectionToken, ValueProvider, inject } from '@angular/core';
import { XuiButtonVariants } from './button';

export interface XuiButtonConfig {
  color: XuiButtonVariants['color'];
  variant: XuiButtonVariants['variant'];
  size: XuiButtonVariants['size'];
}

const defaultConfig: XuiButtonConfig = {
  color: 'primary',
  variant: 'default',
  size: 'md'
};

const XuiButtonConfigToken = new InjectionToken<XuiButtonConfig>('XuiButtonConfig');

export function provideXuiButtonConfig(config: Partial<XuiButtonConfig>): ValueProvider {
  return { provide: XuiButtonConfigToken, useValue: { ...defaultConfig, ...config } };
}

export function injectXuiButtonConfig(): XuiButtonConfig {
  return inject(XuiButtonConfigToken, { optional: true }) ?? defaultConfig;
}
