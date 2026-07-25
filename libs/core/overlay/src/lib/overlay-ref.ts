import type { FocusTrap } from '@angular/cdk/a11y';
import type { OverlayRef } from '@angular/cdk/overlay';
import { signal, type Signal } from '@angular/core';

/**
 * Handle on one open overlay.
 *
 * A ref is single-use: `close()` detaches and disposes the underlying CDK
 * overlay, and `closed` settles. Opening again means asking the factory for a
 * new ref, which keeps reopen paths free of stale positioning state.
 */
export class XOverlayRef<TResult = unknown> {
  private readonly _isOpen = signal(true);
  private readonly _result = signal<TResult | undefined>(undefined);
  private resolveClosed!: (result: TResult | undefined) => void;

  /** Whether the overlay is still attached. */
  readonly isOpen: Signal<boolean> = this._isOpen.asReadonly();

  /** The value passed to `close()`, once it has been called. */
  readonly result: Signal<TResult | undefined> = this._result.asReadonly();

  /** Resolves with the close result. Awaitable for confirm-style flows. */
  readonly closed = new Promise<TResult | undefined>(resolve => {
    this.resolveClosed = resolve;
  });

  constructor(
    private readonly overlayRef: OverlayRef,
    private readonly focusTrap: FocusTrap | null,
    private readonly restoreFocusTo: HTMLElement | null,
    /** Undoes the modal background `inert`; runs before focus is restored. */
    private readonly releaseBackground: (() => void) | null,
    // Takes no argument on purpose: a `(ref: XOverlayRef<TResult>) => void`
    // callback makes the class invariant in `TResult` under strictFunctionTypes,
    // so a registry of mixed-result refs would not type-check. The factory closes
    // over the ref it created instead.
    private readonly onDispose: () => void
  ) {}

  /** The overlay's pane element, for tests and imperative measurement. */
  get pane(): HTMLElement {
    return this.overlayRef.overlayElement;
  }

  /** Detach and dispose. Calling it more than once is a no-op. */
  close(result?: TResult): void {
    if (!this._isOpen()) {
      return;
    }

    this._isOpen.set(false);
    this._result.set(result);

    this.focusTrap?.destroy();
    this.overlayRef.dispose();

    // Un-inert first: the element focus returns to lives in the background that
    // a modal overlay just made unfocusable.
    this.releaseBackground?.();

    // Restore focus after disposal so the element is focusable again — while the
    // overlay is attached a modal one may still be trapping focus.
    this.restoreFocusTo?.focus();

    this.onDispose();
    this.resolveClosed(result);
  }

  /** Recompute the position — call after the content resizes. */
  updatePosition(): void {
    if (this._isOpen()) {
      this.overlayRef.updatePosition();
    }
  }

  /** Resize the overlay pane. */
  updateSize(size: { width?: number | string; height?: number | string }): void {
    if (this._isOpen()) {
      this.overlayRef.updateSize(size);
    }
  }
}
