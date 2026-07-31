import { createXConfigToken } from '@xui/core';
import type { XuiProseVariants } from './prose';

/**
 * Application-wide defaults for XuiProse.
 *
 * Provide it once at the app root so every rendered document reads the same;
 * individual inputs still override the configured value.
 */
export interface XuiProseConfig {
  size: XuiProseVariants['size'];
  density: XuiProseVariants['density'];
}

export const [injectXuiProseConfig, provideXuiProseConfig] = createXConfigToken<XuiProseConfig>('XuiProseConfig', {
  size: 'md',
  density: 'comfortable'
});
