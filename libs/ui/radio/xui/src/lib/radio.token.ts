import { createXConfigToken } from '@xui/core';
import type { XuiRadioVariants } from './radio';

/**
 * Application-wide defaults for the radio package.
 *
 * Provide it once at the app root to re-theme every radio without touching call
 * sites; individual inputs still override the configured value.
 */
export interface XuiRadioConfig {
  /** Default `size` of every `xui-radio`. */
  size: XuiRadioVariants['size'];
  /** Default layout of every `xui-radio-group`. */
  orientation: 'vertical' | 'horizontal';
}

export const [injectXuiRadioConfig, provideXuiRadioConfig] = createXConfigToken<XuiRadioConfig>('XuiRadioConfig', {
  size: 'md',
  orientation: 'vertical'
});
