import { createXConfigToken } from '@xui/core';
import type { XuiNonIdealStateVariants } from './non-ideal-state';

/**
 * Application-wide defaults for XuiNonIdealState.
 *
 * Provide it once at the app root to re-theme every non-ideal state without
 * touching call sites; individual inputs still override the configured value.
 */
export interface XuiNonIdealStateConfig {
  orientation: XuiNonIdealStateVariants['orientation'];
}

export const [injectXuiNonIdealStateConfig, provideXuiNonIdealStateConfig] = createXConfigToken<XuiNonIdealStateConfig>(
  'XuiNonIdealStateConfig',
  {
    orientation: 'vertical'
  }
);
