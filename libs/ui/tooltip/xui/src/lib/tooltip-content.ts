import { InjectionToken, type TemplateRef } from '@angular/core';
import type { XuiTooltipIntent } from './tooltip.token';

/**
 * Everything the tooltip panel needs, handed from the trigger to the panel it
 * attaches to the overlay.
 *
 * The panel is instantiated through a `ComponentPortal`, which cannot bind
 * `@Input`s, so its configuration travels through this token. The `id` is fixed
 * by the trigger so it can point `aria-describedby` at the panel — the tie that
 * makes the hint reach a screen reader.
 */
export interface XuiTooltipContent {
  content: string | TemplateRef<unknown>;
  context?: Record<string, unknown>;
  intent: XuiTooltipIntent;
  compact: boolean;
  id: string;
}

export const XUI_TOOLTIP_CONTENT = new InjectionToken<XuiTooltipContent>('XuiTooltipContent');
