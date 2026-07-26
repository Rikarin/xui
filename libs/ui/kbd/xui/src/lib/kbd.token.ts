import { createXConfigToken } from '@xui/core';
import { XuiKbdVariants } from './kbd';

export interface XuiKbdConfig {
  size: XuiKbdVariants['size'];
}

export const [injectXuiKbdConfig, provideXuiKbdConfig] = createXConfigToken<XuiKbdConfig>('XuiKbdConfig', {
  size: 'md'
});
