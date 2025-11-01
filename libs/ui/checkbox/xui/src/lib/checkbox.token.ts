import { InjectionToken, ValueProvider, inject } from '@angular/core';
import { CheckboxVariants } from './checkbox';

export interface XuiCheckboxConfig {
  color: CheckboxVariants['color'];
  size: CheckboxVariants['size'];
}

const defaultConfig: XuiCheckboxConfig = {
  color: 'primary',
  size: 'md'
};

const XuiCheckboxConfigToken = new InjectionToken<XuiCheckboxConfig>('XuiCheckboxConfig');

export function provideXuiCheckboxConfig(config: Partial<XuiCheckboxConfig>): ValueProvider {
  return { provide: XuiCheckboxConfigToken, useValue: { ...defaultConfig, ...config } };
}

export function injectXuiCheckboxConfig(): XuiCheckboxConfig {
  return inject(XuiCheckboxConfigToken, { optional: true }) ?? defaultConfig;
}
