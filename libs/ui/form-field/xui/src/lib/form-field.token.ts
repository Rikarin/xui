import { createXConfigToken } from '@xui/core';
import { XuiFormFieldColor } from './form-field';

export interface XuiFormFieldConfig {
  color: XuiFormFieldColor;
  inline: boolean;
}

export const [injectXuiFormFieldConfig, provideXuiFormFieldConfig] = createXConfigToken<XuiFormFieldConfig>(
  'XuiFormFieldConfig',
  {
    color: 'none',
    inline: false
  }
);
