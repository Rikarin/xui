import { createXConfigToken } from '@xui/core';
import { XuiBadgeVariants } from './badge';

export interface XuiBadgeConfig {
  color: XuiBadgeVariants['color'];
  size: XuiBadgeVariants['size'];
  static: XuiBadgeVariants['static'];
}

export const [injectXuiBadgeConfig, provideXuiBadgeConfig] = createXConfigToken<XuiBadgeConfig>('XuiBadgeConfig', {
  color: 'primary',
  size: 'md',
  static: false
});
