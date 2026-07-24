import { InjectionToken, type TemplateRef, type Type } from '@angular/core';

/**
 * Navigation handed to a panel's content — the two things a panel can do to the
 * stack it lives in.
 */
export interface XuiPanelStackController {
  /** Push a new panel on top, sliding it in. */
  openPanel<D>(panel: XuiPanel<D>): void;
  /** Pop this panel, sliding back to the one beneath. No-op on the root panel. */
  closePanel(): void;
}

/** One screen in the stack. */
export interface XuiPanel<D = unknown> {
  /** Shown in the header, and as the back label on the panel above. */
  title: string;
  /**
   * What to render. A `TemplateRef` receives `{ $implicit: data, stack }`; a
   * component type is created with `data` and the stack available through DI
   * (`XUI_PANEL_DATA`, `XUI_PANEL_STACK`).
   */
  content: TemplateRef<XuiPanelContext<D>> | Type<unknown>;
  data?: D;
}

/** Context a template panel destructures with `let-`. */
export interface XuiPanelContext<D> {
  $implicit: D;
  stack: XuiPanelStackController;
}

/** The controller, for a component panel to inject. */
export const XUI_PANEL_STACK = new InjectionToken<XuiPanelStackController>('XuiPanelStack');

/** The active panel's `data`, for a component panel to inject. */
export const XUI_PANEL_DATA = new InjectionToken<unknown>('XuiPanelData');
