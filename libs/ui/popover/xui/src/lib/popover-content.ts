import { InjectionToken, type TemplateRef } from '@angular/core';
import type { ClassValue } from 'clsx';

/**
 * Everything the panel needs, handed from the trigger to the panel it attaches
 * to the overlay.
 *
 * The panel is instantiated dynamically through a `ComponentPortal`, which
 * cannot bind `@Input`s, so its configuration travels through this token
 * instead. The panel owns the surface (background, border, shadow, rounding);
 * the trigger owns the content and its context. Passing a `TemplateRef` rather
 * than projecting keeps the trigger's view as the template's declaration
 * context, so the content still sees the trigger's injector and local template
 * variables.
 */
export interface XuiPopoverContent {
  template: TemplateRef<unknown>;
  context?: Record<string, unknown>;
  /** Drop the rounding for a flush panel — menus and select dropdowns. */
  minimal?: boolean;
  /**
   * The content is already a surface, so the panel only positions it.
   *
   * The rule above — the panel owns the surface — holds while the content is bare markup, as a
   * menu's or a listbox's is. A date picker is a finished card in its own right, and layering the
   * panel's surface under it doubled the border and set the panel's corners fighting the card's.
   * The width cap has to go with them: it is sized for prose, and would crop a calendar.
   */
  bare?: boolean;
  /** Fill the pane so a width-matched popover reaches the trigger's edges. */
  fillWidth?: boolean;
  /** Extra classes for the surface. */
  panelClass?: ClassValue;
}

export const XUI_POPOVER_CONTENT = new InjectionToken<XuiPopoverContent>('XuiPopoverContent');
