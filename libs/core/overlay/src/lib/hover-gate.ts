import { DestroyRef, inject } from '@angular/core';

export interface XHoverGateOptions {
  /** Delay before `open` runs, in ms. Read at schedule time, so it can be a signal. */
  openDelay: () => number;
  /** Delay before `close` runs, in ms. Zero closes synchronously. */
  closeDelay: () => number;
  /** Called once the open delay elapses (or immediately when it is zero). */
  open: () => void;
  /** Called once the close delay elapses (or immediately when it is zero). */
  close: () => void;
}

export interface XHoverGate {
  /** Cancel a pending close and open after `openDelay` — immediately when it is zero. */
  scheduleOpen(): void;
  /** Cancel a pending open and close after `closeDelay` — immediately when it is zero. */
  scheduleClose(): void;
  /** Drop both pending timers without calling either callback. */
  cancelPending(): void;
}

/**
 * Debounce an open/close pair the way hover interactions need it.
 *
 * A hover-driven surface (popover, tooltip) must not flicker: entering the
 * trigger opens only after a grace delay, leaving closes after another, and
 * crossing the gap between trigger and pane cancels the close instead of
 * letting it fire. Each side cancels the other, so the pair can never race —
 * the last schedule wins.
 *
 * Call it from a directive or component constructor; the pending timers are
 * cleared when that injection context is destroyed, so a timer can never fire
 * into a dead directive.
 *
 * ```ts
 * private readonly hoverGate = createXHoverGate({
 *   openDelay: () => this.hoverOpenDelay(),
 *   closeDelay: () => this.hoverCloseDelay(),
 *   open: () => this.show(),
 *   close: () => this.hide()
 * });
 * ```
 */
export function createXHoverGate(options: XHoverGateOptions): XHoverGate {
  let openTimer: ReturnType<typeof setTimeout> | null = null;
  let closeTimer: ReturnType<typeof setTimeout> | null = null;

  const cancelOpen = (): void => {
    if (openTimer) {
      clearTimeout(openTimer);
      openTimer = null;
    }
  };

  const cancelClose = (): void => {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  };

  const cancelPending = (): void => {
    cancelOpen();
    cancelClose();
  };

  inject(DestroyRef).onDestroy(cancelPending);

  return {
    scheduleOpen(): void {
      cancelClose();

      if (options.openDelay() === 0) {
        cancelOpen();
        options.open();

        return;
      }

      // `??=`: a second enter while an open is already pending keeps the first
      // deadline rather than pushing the open further away.
      openTimer ??= setTimeout(() => {
        openTimer = null;
        options.open();
      }, options.openDelay());
    },

    scheduleClose(): void {
      cancelOpen();
      cancelClose();

      if (options.closeDelay() === 0) {
        options.close();

        return;
      }

      closeTimer = setTimeout(() => {
        closeTimer = null;
        options.close();
      }, options.closeDelay());
    },

    cancelPending
  };
}
