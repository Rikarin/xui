import { createXConfigToken } from '@xui/core';
import type { XuiSectionVariants } from './section';

/**
 * Application-wide defaults for XuiSection.
 *
 * Provide it once at the app root to re-skin every section without touching
 * call sites; individual inputs still override the configured value.
 */
export interface XuiSectionConfig {
  elevation: XuiSectionVariants['elevation'];
  /** Reduce the header padding. */
  compact: boolean;
}

export const [injectXuiSectionConfig, provideXuiSectionConfig] = createXConfigToken<XuiSectionConfig>(
  'XuiSectionConfig',
  {
    elevation: 0,
    compact: false
  }
);
