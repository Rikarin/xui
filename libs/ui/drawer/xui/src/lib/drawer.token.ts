import { InjectionToken, ValueProvider, inject } from '@angular/core';

/** Which edge the drawer slides in from. */
export type XuiDrawerPosition = 'left' | 'right' | 'top' | 'bottom';

/** The drawer's extent along its sliding axis. */
export type XuiDrawerSize = 'sm' | 'md' | 'lg';

export interface XuiDrawerConfig {
  position: XuiDrawerPosition;
  size: XuiDrawerSize;
  canEscapeKeyClose: boolean;
  canOutsideClickClose: boolean;
  showCloseButton: boolean;
}

const defaultConfig: XuiDrawerConfig = {
  position: 'right',
  size: 'md',
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  showCloseButton: true
};

const XuiDrawerConfigToken = new InjectionToken<XuiDrawerConfig>('XuiDrawerConfig');

/** Application-wide defaults for XuiDrawer. */
export function provideXuiDrawerConfig(config: Partial<XuiDrawerConfig>): ValueProvider {
  return { provide: XuiDrawerConfigToken, useValue: { ...defaultConfig, ...config } };
}

export function injectXuiDrawerConfig(): XuiDrawerConfig {
  return inject(XuiDrawerConfigToken, { optional: true }) ?? defaultConfig;
}
