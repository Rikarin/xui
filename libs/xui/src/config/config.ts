import { InjectionToken } from '@angular/core';
import { InputColor, InputSize } from '../input';
import { ButtonColor, ButtonSize, ButtonType } from '../button';
import { BadgeColor } from '../badge';
import { BannerType } from '../banner';
import { CheckboxColor } from '../checkbox/checkbox.types';
import { DatePickerColor, DatePickerSize } from '../date-picker';
import { SnackBarHorizontalPosition, SnackBarVerticalPosition } from '../snackbar/snackbar.types';

export const BADGE_MODULE = 'badge';
export const BANNER_MODULE = 'banner';
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
  badge?: BadgeConfig;
  banner?: BannerConfig;
  button?: ButtonConfig;
  input?: InputConfig;
  checkbox?: CheckboxConfig;
  datePicker?: DatePickerConfig;

  tooltip?: TooltipConfig;
  snackbar?: SnackbarConfig;
}

export interface BadgeConfig {
  color?: BadgeColor;
}

export interface BannerConfig {
  type?: BannerType;
  dismissible?: boolean;
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

export class SnackbarConfig<D = any> {
  duration?: number = 5000;
  data?: D | null = null;

  horizontalPosition?: SnackBarHorizontalPosition = 'center';
  verticalPosition?: SnackBarVerticalPosition = 'bottom';
}

export const XUI_CONFIG = new InjectionToken<XuiConfig>('xui-config');
