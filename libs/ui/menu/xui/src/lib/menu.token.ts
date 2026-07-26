import { createXConfigToken } from '@xui/core';
import type { XuiMenuItemColor } from './menu-item';

/**
 * Application-wide defaults for the menu package.
 *
 * Provide it once at the app root to re-theme every menu without touching call
 * sites; individual inputs still override the configured value.
 */
export interface XuiMenuConfig {
  /** Default `color` of every `xuiMenuItem`. */
  itemColor: XuiMenuItemColor;
}

export const [injectXuiMenuConfig, provideXuiMenuConfig] = createXConfigToken<XuiMenuConfig>('XuiMenuConfig', {
  itemColor: 'none'
});
