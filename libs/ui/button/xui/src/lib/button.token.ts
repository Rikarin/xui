import { createXConfigToken } from '@xui/core';
import { XuiButtonVariants } from './button';

export interface XuiButtonConfig {
  color: XuiButtonVariants['color'];
  variant: XuiButtonVariants['variant'];
  size: XuiButtonVariants['size'];
}

export const [injectXuiButtonConfig, provideXuiButtonConfig] = createXConfigToken<XuiButtonConfig>('XuiButtonConfig', {
  color: 'primary',
  variant: 'default',
  size: 'md'
});
