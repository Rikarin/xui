import { createXConfigToken } from '@xui/core';
import { XuiTextareaVariants } from './textarea';

export interface XuiTextareaConfig {
  size: XuiTextareaVariants['size'];
}

export const [injectXuiTextareaConfig, provideXuiTextareaConfig] = createXConfigToken<XuiTextareaConfig>(
  'XuiTextareaConfig',
  { size: 'md' }
);
