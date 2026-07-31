import { createXConfigToken } from '@xui/core';
import type { XuiCodeBlockVariants } from './code-block';

/**
 * Application-wide defaults for XuiCodeBlock.
 *
 * Provide it once at the app root to settle how every sample on a site reads —
 * density, gutter, wrapping — without touching call sites; individual inputs
 * still override the configured value.
 */
export interface XuiCodeBlockConfig {
  size: XuiCodeBlockVariants['size'];
  showLineNumbers: boolean;
  wrap: boolean;
}

export const [injectXuiCodeBlockConfig, provideXuiCodeBlockConfig] = createXConfigToken<XuiCodeBlockConfig>(
  'XuiCodeBlockConfig',
  {
    size: 'md',
    showLineNumbers: false,
    wrap: false
  }
);
