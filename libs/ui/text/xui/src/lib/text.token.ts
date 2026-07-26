import { createXConfigToken } from '@xui/core';
import { XuiTextVariants } from './text';

export interface XuiTextConfig {
  /** All axes default to `undefined` so unconfigured text inherits from its surroundings. */
  color?: XuiTextVariants['color'];
  size?: XuiTextVariants['size'];
  weight?: XuiTextVariants['weight'];
}

export const [injectXuiTextConfig, provideXuiTextConfig] = createXConfigToken<XuiTextConfig>('XuiTextConfig', {});
