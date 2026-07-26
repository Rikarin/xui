import { createXConfigToken } from '@xui/core';
import type { XPlacement } from '@xui/core/overlay';

/**
 * How the trigger opens and closes the popover.
 *
 * - `click` — toggles on click; closes on Escape or an outside click.
 * - `hover` — opens while the pointer is over the trigger *or* the popover, so
 *   the pointer can travel into the content without it closing.
 * - `hover-target` — opens on trigger hover only; moving into the popover does
 *   not keep it open. For content the user only reads, never interacts with.
 * - `click-target` — click to open, but only an outside click or Escape closes
 *   it; clicking the trigger again does not toggle it shut.
 */
export type XuiPopoverInteractionKind = 'click' | 'hover' | 'hover-target' | 'click-target';

export interface XuiPopoverConfig {
  interactionKind: XuiPopoverInteractionKind;
  placement: XPlacement;
  /** Gap in pixels between trigger and popover. Forced to 0 when `minimal`. */
  offset: number;
  /** Delay before a hover opens the popover, in ms. */
  hoverOpenDelay: number;
  /** Delay before a hover-out closes it, in ms — long enough to cross the gap. */
  hoverCloseDelay: number;
  /** Strip the offset and rounding for a tight, flush popover. */
  minimal: boolean;
  /** Size the popover to the trigger's width — for select-style dropdowns. */
  matchTargetWidth: boolean;
}

/**
 * Application-wide defaults for XuiPopover. Provide once at the app root to set
 * the house style; individual inputs still override the configured value.
 */
export const [injectXuiPopoverConfig, provideXuiPopoverConfig] = createXConfigToken<XuiPopoverConfig>(
  'XuiPopoverConfig',
  {
    interactionKind: 'click',
    placement: 'bottom',
    offset: 8,
    hoverOpenDelay: 150,
    hoverCloseDelay: 300,
    minimal: false,
    matchTargetWidth: false
  }
);
