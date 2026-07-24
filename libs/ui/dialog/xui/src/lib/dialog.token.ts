import { InjectionToken, ValueProvider, inject } from '@angular/core';

/** The dialog's width preset. */
export type XuiDialogSize = 'sm' | 'md' | 'lg';

export interface XuiDialogConfig {
  size: XuiDialogSize;
  /** Escape closes the dialog. */
  canEscapeKeyClose: boolean;
  /** A click on the backdrop closes the dialog. */
  canOutsideClickClose: boolean;
  /** Show the × in the header. */
  showCloseButton: boolean;
}

const defaultConfig: XuiDialogConfig = {
  size: 'md',
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  showCloseButton: true
};

const XuiDialogConfigToken = new InjectionToken<XuiDialogConfig>('XuiDialogConfig');

/**
 * Application-wide defaults for XuiDialog. Provide once at the app root; each
 * input still overrides the configured value.
 */
export function provideXuiDialogConfig(config: Partial<XuiDialogConfig>): ValueProvider {
  return { provide: XuiDialogConfigToken, useValue: { ...defaultConfig, ...config } };
}

export function injectXuiDialogConfig(): XuiDialogConfig {
  return inject(XuiDialogConfigToken, { optional: true }) ?? defaultConfig;
}

/** The shared surface classes for a dialog by size — reused by the imperative service. */
export const XUI_DIALOG_SIZES: Record<XuiDialogSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl'
};
