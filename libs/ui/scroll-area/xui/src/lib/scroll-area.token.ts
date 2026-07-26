import { createXConfigToken } from '@xui/core';
import type { XuiScrollOrientation } from './scroll-area';

/**
 * Application-wide defaults for XuiScrollArea.
 *
 * Provide it once at the app root to change every scroll area without touching
 * call sites; individual inputs still override the configured value.
 */
export interface XuiScrollAreaConfig {
  orientation: XuiScrollOrientation;
}

export const [injectXuiScrollAreaConfig, provideXuiScrollAreaConfig] = createXConfigToken<XuiScrollAreaConfig>(
  'XuiScrollAreaConfig',
  {
    orientation: 'vertical'
  }
);
