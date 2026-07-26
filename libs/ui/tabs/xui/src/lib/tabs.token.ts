import { createXConfigToken } from '@xui/core';

export interface XuiTabsConfig {
  orientation: 'horizontal' | 'vertical';
  large: boolean;
  animate: boolean;
}

export const [injectXuiTabsConfig, provideXuiTabsConfig] = createXConfigToken<XuiTabsConfig>('XuiTabsConfig', {
  orientation: 'horizontal',
  large: false,
  animate: false
});
