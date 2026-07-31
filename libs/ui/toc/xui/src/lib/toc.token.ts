import { createXConfigToken } from '@xui/core';
import type { XuiTocVariants } from './toc';

/**
 * Application-wide defaults for XuiToc.
 *
 * Provide it once at the app root to settle how every outline reads; individual
 * inputs still override the configured value.
 */
export interface XuiTocConfig {
  size: XuiTocVariants['size'];
}

export const [injectXuiTocConfig, provideXuiTocConfig] = createXConfigToken<XuiTocConfig>('XuiTocConfig', {
  size: 'md'
});
