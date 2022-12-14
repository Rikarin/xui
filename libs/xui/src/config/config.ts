import { InjectionToken } from '@angular/core';
import { InputColor, InputSize } from '../input';
import { ButtonColor, ButtonSize, ButtonType } from '../button';

export const INPUT_MODULE = 'input';
export const BUTTON_MODULE = 'button';

export interface XuiConfig {
  button?: ButtonConfig;
  input?: InputConfig;
}

export interface ButtonConfig {
  stateDelay?: number;

  type?: ButtonType;
  color?: ButtonColor;
  size?: ButtonSize;
}

export interface InputConfig {
  color?: InputColor;
  size?: InputSize;
}

export const XUI_CONFIG = new InjectionToken<XuiConfig>('xui-config');
