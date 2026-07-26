import { createXConfigToken } from '@xui/core';
import type { XuiSegmentedControlVariants } from './segmented-control';

/**
 * Application-wide defaults for XuiSegmentedControl.
 *
 * Provide it once at the app root to re-theme every segmented control without
 * touching call sites; individual inputs still override the configured value.
 */
export interface XuiSegmentedControlConfig {
  size: XuiSegmentedControlVariants['size'];
  /** Stretch to fill the available width instead of hugging the segments. */
  fill: boolean;
}

export const [injectXuiSegmentedControlConfig, provideXuiSegmentedControlConfig] =
  createXConfigToken<XuiSegmentedControlConfig>('XuiSegmentedControlConfig', {
    size: 'md',
    fill: false
  });
