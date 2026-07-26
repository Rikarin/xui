import { InjectionToken } from '@angular/core';

/** The colour and default icon an alert takes. */
export type XuiAlertColor = 'none' | 'primary' | 'success' | 'warning' | 'error';

/** Icon each color implies, unless the caller overrides it. */
export const XUI_ALERT_COLOR_ICON: Record<XuiAlertColor, string | null> = {
  none: null,
  primary: 'matInfoRound',
  success: 'matCheckCircleRound',
  warning: 'matWarningRound',
  error: 'matErrorRound'
};

/** Colour class for the icon, per alert colour. */
export const XUI_ALERT_COLOR_ICON_CLASS: Record<XuiAlertColor, string> = {
  none: 'text-foreground-muted',
  primary: 'text-primary-emphasis',
  success: 'text-success-emphasis',
  warning: 'text-warning-emphasis',
  error: 'text-error-emphasis'
};

/** Button colour that matches the alert colour — `none` confirms in the primary colour. */
export function alertConfirmColor(color: XuiAlertColor): 'primary' | 'success' | 'warning' | 'error' {
  return color === 'none' ? 'primary' : color;
}

/** Options for the imperative `XuiAlertService.confirm()`. */
export interface XuiAlertOptions {
  message: string;
  color?: XuiAlertColor;
  /** Override the icon the color implies. Pass `null` for none. */
  icon?: string | null;
  confirmText?: string;
  /** Omit for an acknowledge-only alert with no cancel button. */
  cancelText?: string;
  canEscapeKeyClose?: boolean;
  canOutsideClickClose?: boolean;
}

export const XUI_ALERT_OPTIONS = new InjectionToken<XuiAlertOptions>('XuiAlertOptions');
