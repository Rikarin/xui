import { createXConfigToken } from '@xui/core';
import { XuiAvatarVariants } from './avatar';

export interface XuiAvatarConfig {
  shape: XuiAvatarVariants['shape'];
  size: XuiAvatarVariants['size'];
}

export const [injectXuiAvatarConfig, provideXuiAvatarConfig] = createXConfigToken<XuiAvatarConfig>('XuiAvatarConfig', {
  shape: 'circle',
  size: 'md'
});
