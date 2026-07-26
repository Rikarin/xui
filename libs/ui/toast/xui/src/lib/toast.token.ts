import { createXConfigToken } from '@xui/core';
import type { XGlobalPosition } from '@xui/core/overlay';

/** Which corner (or centred edge) the toasts stack in. */
export type XuiToastPosition = 'top-left' | 'top' | 'top-right' | 'bottom-left' | 'bottom' | 'bottom-right';

/** The colour and default icon a toast takes. */
export type XuiToastColor = 'none' | 'primary' | 'success' | 'warning' | 'error';

export interface XuiToastConfig {
  position: XuiToastPosition;
  /** Auto-dismiss delay in ms; `0` keeps the toast until dismissed. */
  timeout: number;
  /** Cap on visible toasts; the oldest is dropped past it. */
  maxToasts: number;
}

/** Application-wide defaults for the toaster. */
export const [injectXuiToastConfig, provideXuiToastConfig] = createXConfigToken<XuiToastConfig>('XuiToastConfig', {
  position: 'bottom-right',
  timeout: 5000,
  maxToasts: 5
});

/** Icon each color implies, unless the caller overrides it. */
export const XUI_TOAST_COLOR_ICON: Record<XuiToastColor, string | null> = {
  none: null,
  primary: 'matInfoRound',
  success: 'matCheckCircleRound',
  warning: 'matWarningRound',
  error: 'matErrorRound'
};

/** Icon colour by color. */
export const XUI_TOAST_COLOR_ICON_CLASS: Record<XuiToastColor, string> = {
  none: 'text-foreground-muted',
  primary: 'text-primary-emphasis',
  success: 'text-success-emphasis',
  warning: 'text-warning-emphasis',
  error: 'text-error-emphasis'
};

/** Where each position pins in the viewport. Bottom rows are handled by the container's flow. */
export function toastGlobalPosition(position: XuiToastPosition): XGlobalPosition {
  const gap = '1rem';
  const vertical: XGlobalPosition = position.startsWith('top') ? { top: gap } : { bottom: gap };

  if (position === 'top' || position === 'bottom') {
    return { ...vertical, centerHorizontally: true };
  }

  return position.endsWith('left') ? { ...vertical, left: gap } : { ...vertical, right: gap };
}
