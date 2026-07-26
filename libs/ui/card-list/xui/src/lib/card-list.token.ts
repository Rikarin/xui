import { createXConfigToken } from '@xui/core';

export interface XuiCardListConfig {
  bordered: boolean;
  compact: boolean;
}

export const [injectXuiCardListConfig, provideXuiCardListConfig] = createXConfigToken<XuiCardListConfig>(
  'XuiCardListConfig',
  {
    bordered: true,
    compact: false
  }
);
