import { InjectionToken, ValueProvider, inject } from '@angular/core';
import { ButtonVariants } from './button';

export interface XuiButtonConfig {
  color: ButtonVariants['color'];
  variant: ButtonVariants['variant'];
  size: ButtonVariants['size'];
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
