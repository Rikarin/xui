import { InjectionToken } from '@angular/core';

/** The colour and default icon an alert takes. */
export type XuiAlertIntent = 'none' | 'primary' | 'success' | 'warning' | 'error';

/** Icon each intent implies, unless the caller overrides it. */
export const XUI_ALERT_INTENT_ICON: Record<XuiAlertIntent, string | null> = {
  none: null,
  primary: 'matInfoRound',
  success: 'matCheckCircleRound',
  warning: 'matWarningRound',
  error: 'matErrorRound'
};

/** Colour for the icon, by intent. */
export const XUI_ALERT_INTENT_ICON_CLASS: Record<XuiAlertIntent, string> = {
  none: 'text-foreground-muted',
  primary: 'text-primary-emphasis',
  success: 'text-success-emphasis',
  warning: 'text-warning-emphasis',
  error: 'text-error-emphasis'
};

/** Button colour that matches the intent — `none` confirms in the primary colour. */
export function alertConfirmColor(intent: XuiAlertIntent): 'primary' | 'success' | 'warning' | 'error' {
  return intent === 'none' ? 'primary' : intent;
}

/** Options for the imperative `XuiAlertService.confirm()`. */
export interface XuiAlertOptions {
  message: string;
  intent?: XuiAlertIntent;
  /** Override the icon the intent implies. Pass `null` for none. */
  icon?: string | null;
  confirmText?: string;
  /** Omit for an acknowledge-only alert with no cancel button. */
  cancelText?: string;
  canEscapeKeyClose?: boolean;
  canOutsideClickClose?: boolean;
}

export const XUI_ALERT_OPTIONS = new InjectionToken<XuiAlertOptions>('XuiAlertOptions');
