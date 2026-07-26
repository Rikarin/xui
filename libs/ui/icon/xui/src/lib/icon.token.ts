import { createXConfigToken } from '@xui/core';
import type { XuiIconColor, XuiIconSize } from './icon';

/**
 * Application-wide defaults for XuiIcon.
 *
 * Provide it once at the app root to resize or recolour every icon without
 * touching call sites; individual inputs still override the configured value.
 */
export interface XuiIconConfig {
  size: XuiIconSize;
  color: XuiIconColor;
}

export const [injectXuiIconConfig, provideXuiIconConfig] = createXConfigToken<XuiIconConfig>('XuiIconConfig', {
  size: 'md',
  color: 'inherit'
});
