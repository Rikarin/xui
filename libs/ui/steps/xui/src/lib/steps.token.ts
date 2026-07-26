import { createXConfigToken } from '@xui/core';

export interface XuiStepsConfig {
  orientation: 'horizontal' | 'vertical';
  clickable: boolean;
}

export const [injectXuiStepsConfig, provideXuiStepsConfig] = createXConfigToken<XuiStepsConfig>('XuiStepsConfig', {
  orientation: 'horizontal',
  clickable: false
});
