import { createXConfigToken } from '@xui/core';
import { XuiUploadType } from './upload';

export interface XuiUploadConfig {
  type: XuiUploadType;
}

export const [injectXuiUploadConfig, provideXuiUploadConfig] = createXConfigToken<XuiUploadConfig>('XuiUploadConfig', {
  type: 'select'
});
