import { createXConfigToken } from '@xui/core';
import type { XuiResultStatus } from './result';

/**
 * Application-wide defaults for XuiResult.
 *
 * Provide it once at the app root to change every result page without touching
 * call sites; individual inputs still override the configured value.
 */
export interface XuiResultConfig {
  status: XuiResultStatus;
}

export const [injectXuiResultConfig, provideXuiResultConfig] = createXConfigToken<XuiResultConfig>('XuiResultConfig', {
  status: 'info'
});
