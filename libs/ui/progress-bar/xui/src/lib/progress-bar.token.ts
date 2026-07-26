import { createXConfigToken } from '@xui/core';
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

export const [injectXuiProgressBarConfig, provideXuiProgressBarConfig] = createXConfigToken<XuiProgressBarConfig>(
  'XuiProgressBarConfig',
  {
    color: 'primary',
    size: 'md',
    stripes: true,
    animate: true
  }
);
