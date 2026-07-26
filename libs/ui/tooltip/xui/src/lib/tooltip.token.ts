import { InjectionToken, ValueProvider, inject } from '@angular/core';
import type { XPlacement } from '@xui/core/overlay';

/** The colour a tooltip takes. `none` is the neutral inverted style. */
export type XuiTooltipColor = 'none' | 'primary' | 'success' | 'error' | 'warning' | 'info';

export interface XuiTooltipConfig {
  placement: XPlacement;
  color: XuiTooltipColor;
  /** Tighten the padding for dense UIs. */
  compact: boolean;
  /** Also open when the trigger is focused, so keyboard users see the hint. */
  openOnTargetFocus: boolean;
  /** Delay before a hover opens the tooltip, in ms. */
  hoverOpenDelay: number;
  /** Delay before a hover-out closes it, in ms. */
  hoverCloseDelay: number;
  /** Gap in pixels between trigger and tooltip. */
  offset: number;
}

const defaultConfig: XuiTooltipConfig = {
  placement: 'top',
  color: 'none',
  compact: false,
  openOnTargetFocus: true,
  hoverOpenDelay: 100,
  hoverCloseDelay: 0,
  offset: 6
};

const XuiTooltipConfigToken = new InjectionToken<XuiTooltipConfig>('XuiTooltipConfig');

/**
 * Application-wide defaults for XuiTooltip. Provide once at the app root; each
 * input still overrides the configured value.
 */
export function provideXuiTooltipConfig(config: Partial<XuiTooltipConfig>): ValueProvider {
  return { provide: XuiTooltipConfigToken, useValue: { ...defaultConfig, ...config } };
}

export function injectXuiTooltipConfig(): XuiTooltipConfig {
  return inject(XuiTooltipConfigToken, { optional: true }) ?? defaultConfig;
}
