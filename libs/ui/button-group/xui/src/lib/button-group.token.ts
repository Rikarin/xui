import { createXConfigToken } from '@xui/core';

export interface XuiButtonGroupConfig {
  orientation: 'horizontal' | 'vertical';
  fill: boolean;
}

export const [injectXuiButtonGroupConfig, provideXuiButtonGroupConfig] = createXConfigToken<XuiButtonGroupConfig>(
  'XuiButtonGroupConfig',
  {
    orientation: 'horizontal',
    fill: false
  }
);
