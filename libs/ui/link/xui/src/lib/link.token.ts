import { InjectionToken, ValueProvider, inject } from '@angular/core';
import type { LinkVariants } from './link';

/**
 * Application-wide defaults for XuiLink.
 *
 * Provide it once at the app root to re-skin every link without touching call
 * sites; individual inputs still override the configured value.
 */
export interface XuiLinkConfig {
  color: LinkVariants['color'];
  underline: LinkVariants['underline'];
}

const defaultConfig: XuiLinkConfig = {
  color: 'link',
  underline: 'always'
};

const XuiLinkConfigToken = new InjectionToken<XuiLinkConfig>('XuiLinkConfig');

export function provideXuiLinkConfig(config: Partial<XuiLinkConfig>): ValueProvider {
  return { provide: XuiLinkConfigToken, useValue: { ...defaultConfig, ...config } };
}

export function injectXuiLinkConfig(): XuiLinkConfig {
  return inject(XuiLinkConfigToken, { optional: true }) ?? defaultConfig;
}
