import { createXConfigToken } from '@xui/core';
import type { XuiSpinnerVariants } from './spinner';

/**
 * Application-wide defaults for XuiSpinner.
 *
 * Provide it once at the app root to re-skin every spinner without touching
 * call sites; individual inputs still override the configured value.
 */
export interface XuiSpinnerConfig {
  color: XuiSpinnerVariants['color'];
  size: XuiSpinnerVariants['size'];
}

export const [injectXuiSpinnerConfig, provideXuiSpinnerConfig] = createXConfigToken<XuiSpinnerConfig>(
  'XuiSpinnerConfig',
  {
    color: 'primary',
    size: 'md'
  }
);
