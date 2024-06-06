import { InjectionToken, ViewContainerRef } from '@angular/core';
import { InputColor, InputSize } from '../input';
import { ButtonColor, ButtonSize, ButtonType } from '../button';
import { BadgeColor } from '../badge';
import { BannerType } from '../banner';
import { CheckboxColor } from '../checkbox';
import { DatePickerColor, DatePickerSize } from '../date-picker';
import { SnackBarHorizontalPosition, SnackBarVerticalPosition } from '../snack-bar';
import { Direction, Directionality } from '@angular/cdk/bidi';
import { AriaLivePoliteness } from '@angular/cdk/a11y';

export const BUTTON_MODULE = 'button';
export const CHECKBOX_MODULE = 'checkbox';
export const DATE_PICKER_MODULE = 'datePicker';
export const TOOLTIP_MODULE = 'tooltip';
export const SNACKBAR_MODULE = 'snackbar';

// TODO: finish these
export const DECAGRAM_MODULE = 'decagram';
export const DIVIDER_MODULE = 'divider';
export const IMAGE_UPLOAD_MODULE = 'imageUpload';
export const INPUT_MODULE = 'input';
export const LAYOUT_MODULE = 'layout';
// export const MENU_MODULE

export interface XuiConfig {
  button?: ButtonConfig;
  input?: InputConfig;
  checkbox?: CheckboxConfig;
  datePicker?: DatePickerConfig;

  tooltip?: TooltipConfig;
  snackbar?: SnackBarConfig;
}

export interface ButtonConfig {
  stateDelay?: number;

  type?: ButtonType;
  color?: ButtonColor;
  size?: ButtonSize;
}

export interface CheckboxConfig {
  color?: CheckboxColor;
  disabled?: boolean;
}

export interface DatePickerConfig {
  color?: DatePickerColor;
  size?: DatePickerSize;
}

export interface InputConfig {
  color?: InputColor;
  size?: InputSize;
}

export interface TooltipConfig {
  disabled?: boolean;
}

export class SnackBarConfig<D = any> {
  duration?: number = 5000;
  data?: D | null = null;

  /**
   * The view container that serves as the parent for the snackbar for the purposes of dependency
   * injection. Note: this does not affect where the snackbar is inserted in the DOM.
   */
  viewContainerRef?: ViewContainerRef | null;

  /** The politeness level for the LiveAnnouncer announcement. */
  politeness?: AriaLivePoliteness = 'assertive';

  /**
   * Message to be announced by the LiveAnnouncer. When opening a snackbar without a custom
   * component or template, the announcement message will default to the specified message.
   */
  announcementMessage?: string = '';

  /** Text layout direction for the snack bar. */
  direction?: Direction | Directionality;

  /** Extra CSS classes to be added to the snack bar container. */
  panelClass?: string | string[];

  horizontalPosition?: SnackBarHorizontalPosition = 'center';
  verticalPosition?: SnackBarVerticalPosition = 'bottom';
}

export const XUI_CONFIG = new InjectionToken<XuiConfig>('xui-config');
