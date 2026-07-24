import { InjectionToken, ValueProvider, inject } from '@angular/core';
import type { SpinnerVariants } from './spinner';

/**
 * Application-wide defaults for XuiSpinner.
 *
 * Provide it once at the app root to re-skin every spinner without touching
 * call sites; individual inputs still override the configured value.
 */
export interface XuiSpinnerConfig {
  color: SpinnerVariants['color'];
  size: SpinnerVariants['size'];
}

const defaultConfig: XuiSpinnerConfig = {
  color: 'primary',
  size: 'md'
};

const XuiSpinnerConfigToken = new InjectionToken<XuiSpinnerConfig>('XuiSpinnerConfig');

export function provideXuiSpinnerConfig(config: Partial<XuiSpinnerConfig>): ValueProvider {
  return { provide: XuiSpinnerConfigToken, useValue: { ...defaultConfig, ...config } };
}

export function injectXuiSpinnerConfig(): XuiSpinnerConfig {
  return inject(XuiSpinnerConfigToken, { optional: true }) ?? defaultConfig;
}
