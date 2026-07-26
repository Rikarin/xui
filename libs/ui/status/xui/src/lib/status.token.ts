import { createXConfigToken } from '@xui/core';
import { XuiStatusVariants } from './status';

export interface XuiStatusConfig {
  presence: XuiStatusVariants['presence'];
  size: XuiStatusVariants['size'];
}

export const [injectXuiStatusConfig, provideXuiStatusConfig] = createXConfigToken<XuiStatusConfig>('XuiStatusConfig', {
  presence: 'offline',
  size: 'md'
});
