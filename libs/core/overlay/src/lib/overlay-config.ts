import type { ElementRef } from '@angular/core';
import type { XPlacement } from './placement';

/** What the overlay positions itself against. */
export type XOverlayOrigin = ElementRef<HTMLElement> | HTMLElement;

/**
 * How the overlay reacts to the page scrolling underneath it.
 *
 * - `reposition` — follow the trigger (popovers, tooltips, menus)
 * - `block`      — lock the page (modal dialogs, drawers)
 * - `close`      — dismiss on scroll (hover cards)
 * - `noop`       — do nothing
 */
export type XScrollStrategy = 'reposition' | 'block' | 'close' | 'noop';

/**
 * Where a `global` overlay sits in the viewport.
 *
 * Any edge offset given pins that edge; unset edges are free. `centerHorizontally`
 * / `centerVertically` centre on the free axis. With nothing set the overlay
 * centres on both axes — the default for a dialog. A right drawer pins
 * `{ top: '0', right: '0', bottom: '0' }`; a bottom-right toast pins
 * `{ bottom: '1rem', right: '1rem' }`.
 */
export interface XGlobalPosition {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  centerHorizontally?: boolean;
  centerVertically?: boolean;
}

export interface XOverlayConfig {
  /**
   * `connected` anchors to `origin`; `global` centres in the viewport.
   * Defaults to `connected` when an origin is given, `global` otherwise.
   */
  position?: 'connected' | 'global';
  /** For a `global` overlay, where it pins. Defaults to centred. */
  globalPosition?: XGlobalPosition;
  /** The element a connected overlay anchors to. */
  origin?: XOverlayOrigin;
  /** Preferred placement for a connected overlay. */
  placement?: XPlacement;
  /** Gap in pixels between trigger and overlay. */
  offset?: number;
  /** Whether the overlay may flip/shift to stay in the viewport. */
  flip?: boolean;
  /** Match the overlay's width to the trigger's — for select-style dropdowns. */
  matchOriginWidth?: boolean;

  hasBackdrop?: boolean;
  backdropClass?: string | string[];
  panelClass?: string | string[];
  scrollStrategy?: XScrollStrategy;

  /** Close when Escape is pressed. */
  closeOnEscape?: boolean;
  /** Close when a pointer event lands outside the overlay (and outside the origin). */
  closeOnOutsideClick?: boolean;
  /** Close when the backdrop is clicked. Implied by `closeOnOutsideClick` when a backdrop exists. */
  closeOnBackdropClick?: boolean;

  /** Keep Tab focus inside the overlay while it is open. */
  trapFocus?: boolean;
  /**
   * Treat the overlay as modal: emit `aria-modal="true"` and mark the rest of
   * the document `inert` so assistive tech cannot browse the page behind it.
   * Defaults to `trapFocus && hasBackdrop` — trapping Tab without hiding the
   * background leaves screen-reader users able to read past the barrier, while
   * a trapping overlay with no backdrop (a `role="dialog"` popover) still wants
   * outside clicks to land.
   */
  modal?: boolean;
  /** Move focus into the overlay when it opens. */
  autoFocus?: boolean;
  /** Return focus to whatever had it before the overlay opened. */
  restoreFocus?: boolean;

  /** Forwarded to the overlay pane so screen readers announce it correctly. */
  role?: 'dialog' | 'alertdialog' | 'menu' | 'listbox' | 'tooltip' | 'grid' | null;
  ariaLabel?: string | null;
  ariaLabelledBy?: string | null;
  ariaDescribedBy?: string | null;

  /**
   * Plays the overlay out before it is torn down.
   *
   * Return a promise and the overlay stays in the DOM — no longer taking pointer
   * events — until it settles; return nothing and teardown is immediate, which is
   * what a caller does when the motion is off, or when there is nothing to animate
   * with. Every way of closing runs it, so Escape and a backdrop click leave the
   * same way the close button does.
   */
  exit?: (surfaces: { pane: HTMLElement; backdrop: HTMLElement | null }) => Promise<unknown> | void;

  /** Extra injector-scoped providers for the attached content. */
  providers?: unknown[];
  /**
   * Context for template content — `$implicit` plus any named values the
   * template destructures with `let-`. Ignored for component content, which
   * takes its inputs through `providers` or its own API instead.
   */
  context?: Record<string, unknown>;
}

/**
 * Defaults tuned for a click-triggered popover, the most common case. Modal
 * surfaces (dialog, drawer) override `position`, `hasBackdrop`, `scrollStrategy`
 * and the focus flags.
 */
export const X_OVERLAY_DEFAULTS = {
  placement: 'bottom-start',
  offset: 8,
  flip: true,
  matchOriginWidth: false,
  hasBackdrop: false,
  scrollStrategy: 'reposition',
  closeOnEscape: true,
  closeOnOutsideClick: true,
  closeOnBackdropClick: true,
  trapFocus: false,
  autoFocus: false,
  restoreFocus: true,
  role: null,
  ariaLabel: null,
  ariaLabelledBy: null,
  ariaDescribedBy: null
} as const satisfies XOverlayConfig;
