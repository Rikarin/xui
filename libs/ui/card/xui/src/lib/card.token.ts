import { createXConfigToken } from '@xui/core';
import type { XuiCardElevation } from './card';

/**
 * Application-wide defaults for XuiCard.
 *
 * Provide it once at the app root to re-skin every card without touching call
 * sites; individual inputs still override the configured value.
 */
export interface XuiCardConfig {
  elevation: XuiCardElevation;
  compact: boolean;
}

export const [injectXuiCardConfig, provideXuiCardConfig] = createXConfigToken<XuiCardConfig>('XuiCardConfig', {
  elevation: 0,
  compact: false
});
