import { OverlayRef } from '@angular/cdk/overlay';
import { SnackBarContainer } from './snack-bar-container';
import { Observable, Subject } from 'rxjs';

const MAX_TIMEOUT = Math.pow(2, 31) - 1;

/** Event that is emitted when a snack bar is dismissed. */
export interface XuiSnackBarDismiss {
  /** Whether the snack bar was dismissed using the action button. */
  dismissedByAction: boolean;
}

export class SnackBarRef<T> {
  instance!: T;

  /** Subject for notifying the user that the snack bar has been dismissed. */
  private readonly _afterDismissed = new Subject<XuiSnackBarDismiss>();

  /** Subject for notifying the user that the snack bar action was called. */
  private readonly _onAction = new Subject<void>();

  /**
   * Timeout ID for the duration setTimeout call. Used to clear the timeout if the snackbar is
   * dismissed before the duration passes.
   */
  private durationTimeoutId!: number;

  /** Whether the snack bar was dismissed using the action button. */
  private dismissedByAction = false;

  constructor(
    public containerInstance: SnackBarContainer,
    private overlayRef: OverlayRef
  ) {
    containerInstance.onExit.subscribe(() => this.finishDismiss());
  }

  /** Dismisses the snack bar. */
  dismiss(): void {
    if (!this._afterDismissed.closed) {
      this.containerInstance.exit();
    }

    clearTimeout(this.durationTimeoutId);
  }

  /** Marks the snackbar action clicked. */
  dismissWithAction(): void {
    if (!this._onAction.closed) {
      this.dismissedByAction = true;
      this._onAction.next();
      this._onAction.complete();
      this.dismiss();
    }

    clearTimeout(this.durationTimeoutId);
  }

  /** Dismisses the snack bar after some duration */
  _dismissAfter(duration: number): void {
    // Note that we need to cap the duration to the maximum value for setTimeout, because
    this.durationTimeoutId = setTimeout(() => this.dismiss(), Math.min(duration, MAX_TIMEOUT)) as any;
  }

  /** Gets an observable that is notified when the snack bar is finished closing. */
  afterDismissed(): Observable<XuiSnackBarDismiss> {
    return this._afterDismissed;
  }

  /** Gets an observable that is notified when the snack bar has opened and appeared. */
  afterOpened(): Observable<void> {
    return this.containerInstance.onEnter;
  }

  /** Gets an observable that is notified when the snack bar action is called. */
  onAction(): Observable<void> {
    return this._onAction;
  }

  /** Cleans up the DOM after closing. */
  private finishDismiss(): void {
    this.overlayRef.dispose();

    if (!this._onAction.closed) {
      this._onAction.complete();
    }

    this._afterDismissed.next({ dismissedByAction: this.dismissedByAction });
    this._afterDismissed.complete();
    this.dismissedByAction = false;
  }
}
