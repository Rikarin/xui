import { InjectionToken, ValueProvider, inject } from '@angular/core';
import type { XuiProgressBarVariants } from './progress-bar';

/**
 * Application-wide defaults for XuiProgressBar.
 *
 * Provide it once at the app root to re-skin every progress bar without
 * touching call sites; individual inputs still override the configured value.
 */
export interface XuiProgressBarConfig {
  color: XuiProgressBarVariants['color'];
  size: XuiProgressBarVariants['size'];
  stripes: boolean;
  animate: boolean;
}

const defaultConfig: XuiProgressBarConfig = {
  color: 'primary',
  size: 'md',
  stripes: true,
  animate: true
};

const XuiProgressBarConfigToken = new InjectionToken<XuiProgressBarConfig>('XuiProgressBarConfig');

export function provideXuiProgressBarConfig(config: Partial<XuiProgressBarConfig>): ValueProvider {
  return { provide: XuiProgressBarConfigToken, useValue: { ...defaultConfig, ...config } };
}

export function injectXuiProgressBarConfig(): XuiProgressBarConfig {
  return inject(XuiProgressBarConfigToken, { optional: true }) ?? defaultConfig;
}
