import { createXConfigToken } from '@xui/core';
import { XuiCheckboxVariants } from './checkbox';

export interface XuiCheckboxConfig {
  color: XuiCheckboxVariants['color'];
  size: XuiCheckboxVariants['size'];
}

export const [injectXuiCheckboxConfig, provideXuiCheckboxConfig] = createXConfigToken<XuiCheckboxConfig>(
  'XuiCheckboxConfig',
  {
    color: 'primary',
    size: 'md'
  }
);
