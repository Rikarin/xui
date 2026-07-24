import { InjectionToken, ValueProvider, inject } from '@angular/core';

/** The switch's size. */
export type XuiSwitchSize = 'default' | 'large';

export interface XuiSwitchConfig {
  size: XuiSwitchSize;
}

const defaultConfig: XuiSwitchConfig = { size: 'default' };

const XuiSwitchConfigToken = new InjectionToken<XuiSwitchConfig>('XuiSwitchConfig');

/** Application-wide defaults for XuiSwitch. */
export function provideXuiSwitchConfig(config: Partial<XuiSwitchConfig>): ValueProvider {
  return { provide: XuiSwitchConfigToken, useValue: { ...defaultConfig, ...config } };
}

export function injectXuiSwitchConfig(): XuiSwitchConfig {
  return inject(XuiSwitchConfigToken, { optional: true }) ?? defaultConfig;
}
