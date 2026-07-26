import { createXConfigToken } from '@xui/core';

/** Which edge the drawer slides in from. */
export type XuiDrawerPosition = 'left' | 'right' | 'top' | 'bottom';

/** The drawer's extent along its sliding axis. */
export type XuiDrawerSize = 'sm' | 'md' | 'lg';

export interface XuiDrawerConfig {
  position: XuiDrawerPosition;
  size: XuiDrawerSize;
  canEscapeKeyClose: boolean;
  canOutsideClickClose: boolean;
  showCloseButton: boolean;
}

/** Application-wide defaults for XuiDrawer. */
export const [injectXuiDrawerConfig, provideXuiDrawerConfig] = createXConfigToken<XuiDrawerConfig>('XuiDrawerConfig', {
  position: 'right',
  size: 'md',
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  showCloseButton: true
});
