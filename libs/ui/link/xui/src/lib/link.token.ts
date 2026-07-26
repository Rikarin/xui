import { createXConfigToken } from '@xui/core';
import type { XuiLinkVariants } from './link';

/**
 * Application-wide defaults for XuiLink.
 *
 * Provide it once at the app root to re-skin every link without touching call
 * sites; individual inputs still override the configured value.
 */
export interface XuiLinkConfig {
  color: XuiLinkVariants['color'];
  underline: XuiLinkVariants['underline'];
}

export const [injectXuiLinkConfig, provideXuiLinkConfig] = createXConfigToken<XuiLinkConfig>('XuiLinkConfig', {
  color: 'link',
  underline: 'always'
});
