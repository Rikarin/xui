import { InjectionToken, ValueProvider, inject } from '@angular/core';
import type { XuiCardElevation } from './card';

/**
 * Application-wide defaults for XuiCard.
 *
 * Provide it once at the app root to re-skin every card without touching call
 * sites; individual inputs still override the configured value.
 */
export interface XuiCardConfig {
  elevation: XuiCardElevation;
  compact: boolean;
}

const defaultConfig: XuiCardConfig = {
  elevation: 0,
  compact: false
};

const XuiCardConfigToken = new InjectionToken<XuiCardConfig>('XuiCardConfig');

export function provideXuiCardConfig(config: Partial<XuiCardConfig>): ValueProvider {
  return { provide: XuiCardConfigToken, useValue: { ...defaultConfig, ...config } };
}

export function injectXuiCardConfig(): XuiCardConfig {
  return inject(XuiCardConfigToken, { optional: true }) ?? defaultConfig;
}
