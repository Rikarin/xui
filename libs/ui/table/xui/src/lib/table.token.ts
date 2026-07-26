import { createXConfigToken } from '@xui/core';

export interface XuiTableConfig {
  striped: boolean;
  bordered: boolean;
  interactive: boolean;
  compact: boolean;
}

export const [injectXuiTableConfig, provideXuiTableConfig] = createXConfigToken<XuiTableConfig>('XuiTableConfig', {
  striped: false,
  bordered: false,
  interactive: false,
  compact: false
});
