import { createXConfigToken } from '@xui/core';
import { XuiCalloutColor } from './callout';

export interface XuiCalloutConfig {
  color: XuiCalloutColor;
  minimal: boolean;
  compact: boolean;
}

export const [injectXuiCalloutConfig, provideXuiCalloutConfig] = createXConfigToken<XuiCalloutConfig>(
  'XuiCalloutConfig',
  {
    color: 'none',
    minimal: false,
    compact: false
  }
);
