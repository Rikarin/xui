import { createXConfigToken } from '@xui/core';
import type { XuiSliderColor } from './slider';

/**
 * Application-wide defaults for XuiSlider.
 *
 * Provide it once at the app root to re-theme every slider without touching
 * call sites; individual inputs still override the configured value.
 */
export interface XuiSliderConfig {
  color: XuiSliderColor;
  orientation: 'horizontal' | 'vertical';
  /** Fill the track up to the handle. */
  showTrackFill: boolean;
}

export const [injectXuiSliderConfig, provideXuiSliderConfig] = createXConfigToken<XuiSliderConfig>('XuiSliderConfig', {
  color: 'primary',
  orientation: 'horizontal',
  showTrackFill: true
});
