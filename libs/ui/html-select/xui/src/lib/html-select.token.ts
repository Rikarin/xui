import { createXConfigToken } from '@xui/core';
import { XuiHtmlSelectVariants } from './html-select';

export interface XuiHtmlSelectConfig {
  size: XuiHtmlSelectVariants['size'];
  fill: boolean;
}

export const [injectXuiHtmlSelectConfig, provideXuiHtmlSelectConfig] = createXConfigToken<XuiHtmlSelectConfig>(
  'XuiHtmlSelectConfig',
  {
    size: 'md',
    fill: false
  }
);
