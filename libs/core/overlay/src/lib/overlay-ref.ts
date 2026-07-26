import type { FocusTrap } from '@angular/cdk/a11y';
import type { OverlayRef } from '@angular/cdk/overlay';
import { signal, type Signal } from '@angular/core';
import type { XOverlayConfig } from './overlay-config';

/**
 * How long an `exit` animation is given before the overlay is torn down anyway.
 *
 * An animation only advances while the document is rendering, so one that starts in
 * a tab the user then leaves never settles — and the overlay would sit there with the
 * page behind it still inert and still scroll-locked. No dismissal is worth a second.
 */
const EXIT_GRACE_MS = 1000;

/**
 * Handle on one open overlay.
 *
 * A ref is single-use: `close()` detaches and disposes the underlying CDK
 * overlay, and `closed` settles. Opening again means asking the factory for a
 * new ref, which keeps reopen paths free of stale positioning state.
 */
export class XOverlayRef<TResult = unknown> {
  private disposed = false;
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
    private readonly onDispose: () => void,
    /** Plays the overlay out before teardown. See {@link XOverlayConfig.exit}. */
    private readonly exit: XOverlayConfig['exit'] = undefined
  ) {}

  /** The overlay's pane element, for tests and imperative measurement. */
  get pane(): HTMLElement {
    return this.overlayRef.overlayElement;
  }

  /** The backdrop behind a modal overlay, for an exit animation to fade out. */
  get backdrop(): HTMLElement | null {
    return this.overlayRef.backdropElement;
  }

  /**
   * Detach and dispose. Calling it more than once is a no-op.
   *
   * With an `exit` animation the overlay is closed from this moment — `isOpen` is
   * false and a second call does nothing — but stays on screen until the animation
   * settles. `closed` resolves once it is really gone.
   */
  close(result?: TResult): void {
    if (!this._isOpen()) {
      return;
    }

    this._isOpen.set(false);
    this._result.set(result);

    const playingOut = this.exit?.({ pane: this.pane, backdrop: this.backdrop });

    if (!playingOut) {
      this.dispose(result);

      return;
    }

    // On its way out it must not take a click meant for the page behind it, and
    // the trap has to let go before focus is restored to the element outside.
    this.pane.style.pointerEvents = 'none';
    this.focusTrap?.destroy();

    // A rejected exit — an animation cancelled by a reopen — still tears down;
    // leaving the overlay attached forever is the worse failure, which is what the
    // grace period is there for too.
    void Promise.race([
      playingOut.catch(() => undefined),
      new Promise(settle => setTimeout(settle, EXIT_GRACE_MS))
    ]).then(() => this.dispose(result));
  }

  /**
   * Tear down now, skipping any exit animation.
   *
   * For when the overlay cannot outlive what is happening — the view that owns it
   * being destroyed, say, which takes the content out from under it.
   */
  dispose(result?: TResult): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;
    this._isOpen.set(false);

    this.focusTrap?.destroy();
    this.overlayRef.dispose();

    // Un-inert first: the element focus returns to lives in the background that
    // a modal overlay just made unfocusable.
    this.releaseBackground?.();

    // Restore focus after disposal so the element is focusable again — while the
    // overlay is attached a modal one may still be trapping focus.
    this.restoreFocusTo?.focus();

    this.onDispose();
    this.resolveClosed(result ?? this._result());
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
