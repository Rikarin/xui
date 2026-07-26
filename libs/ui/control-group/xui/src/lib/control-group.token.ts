import { createXConfigToken } from '@xui/core';

export interface XuiControlGroupConfig {
  orientation: 'horizontal' | 'vertical';
  fill: boolean;
}

export const [injectXuiControlGroupConfig, provideXuiControlGroupConfig] = createXConfigToken<XuiControlGroupConfig>(
  'XuiControlGroupConfig',
  {
    orientation: 'horizontal',
    fill: false
  }
);
