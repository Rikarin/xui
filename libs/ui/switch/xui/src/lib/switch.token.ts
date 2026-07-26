import { createXConfigToken } from '@xui/core';

/** The switch's size. */
export type XuiSwitchSize = 'md' | 'lg';

export interface XuiSwitchConfig {
  size: XuiSwitchSize;
}

/** Application-wide defaults for XuiSwitch. */
export const [injectXuiSwitchConfig, provideXuiSwitchConfig] = createXConfigToken<XuiSwitchConfig>('XuiSwitchConfig', {
  size: 'md'
});
