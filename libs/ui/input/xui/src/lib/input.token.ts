import { createXConfigToken } from '@xui/core';
import { XuiInputVariants } from './input';

export interface XuiInputConfig {
  size: XuiInputVariants['size'];
  surface: XuiInputVariants['surface'];
  color: XuiInputVariants['color'];
}

export const [injectXuiInputConfig, provideXuiInputConfig] = createXConfigToken<XuiInputConfig>('XuiInputConfig', {
  size: 'md',
  surface: 'dark',
  color: 'none'
});
