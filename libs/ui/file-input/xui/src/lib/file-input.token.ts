import { createXConfigToken } from '@xui/core';
import { XuiFileInputVariants } from './file-input';

export interface XuiFileInputConfig {
  size: XuiFileInputVariants['size'];
  fill: boolean;
}

export const [injectXuiFileInputConfig, provideXuiFileInputConfig] = createXConfigToken<XuiFileInputConfig>(
  'XuiFileInputConfig',
  {
    size: 'md',
    fill: false
  }
);
