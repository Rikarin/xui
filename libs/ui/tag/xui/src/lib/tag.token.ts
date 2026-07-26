import { createXConfigToken } from '@xui/core';
import { XuiTagColor } from './tag';

export interface XuiTagConfig {
  color: XuiTagColor;
  minimal: boolean;
  large: boolean;
  round: boolean;
  interactive: boolean;
}

export const [injectXuiTagConfig, provideXuiTagConfig] = createXConfigToken<XuiTagConfig>('XuiTagConfig', {
  color: 'none',
  minimal: false,
  large: false,
  round: false,
  interactive: false
});
