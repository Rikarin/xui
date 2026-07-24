import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { injectXOverlay, type XOverlayRef } from '@xui/core/overlay';
import type { XuiToastData } from './toast';
import { XuiToastContainer } from './toast-container';
import { injectXuiToastConfig, toastGlobalPosition, type XuiToastIntent, type XuiToastPosition } from './toast.token';

/** What a caller passes to raise a toast. */
export interface XuiToastOptions {
  message: string;
  intent?: XuiToastIntent;
  /** Override the icon the intent implies. `null` shows none. */
  icon?: string | null;
  /** Add an action button with this label. */
  actionText?: string;
  /** Run when the action is pressed; the toast dismisses afterwards. */
  onAction?: () => void;
  /** Override the configured auto-dismiss delay; `0` keeps it until dismissed. */
  timeout?: number;
}

/**
 * Raises transient notices that stack in a corner and dismiss themselves.
 *
 * ```ts
 * this.toaster.show({ message: 'Saved', intent: 'success' });
 * this.toaster.show({ message: 'Upload failed', intent: 'error', actionText: 'Retry', onAction: () => this.retry() });
 * ```
 *
 * The toaster keeps its list in a signal and mounts a single corner-pinned
 * overlay (no backdrop, page still scrolls) the first time it is used — reusing
 * the core overlay's new `globalPosition` for placement. Past `maxToasts` the
 * oldest is dropped, so a burst of notices can never bury the screen.
 */
@Injectable({ providedIn: 'root' })
export class XuiToastService {
  private readonly overlay = injectXOverlay();
  private readonly config = injectXuiToastConfig();

  private readonly _toasts = signal<XuiToastData[]>([]);
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private ref: XOverlayRef | null = null;
  private nextId = 0;

  /** The live toasts, oldest first. Read by the container. */
  readonly toasts = this._toasts.asReadonly();

  /** The corner they stack in. Read by the container to pick its flow direction. */
  readonly position = signal<XuiToastPosition>(this.config.position);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clear());
  }

  /** Raise a toast and return its id, for imperative dismissal. */
  show(options: XuiToastOptions): number {
    this.ensureMounted();

    const id = this.nextId++;
    const toast: XuiToastData = {
      id,
      message: options.message,
      intent: options.intent ?? 'none',
      icon: options.icon,
      actionText: options.actionText,
      onAction: options.onAction
    };

    this._toasts.update(list => {
      const next = [...list, toast];

      // Drop the oldest past the cap so a flood cannot bury the screen.
      return next.length > this.config.maxToasts ? next.slice(next.length - this.config.maxToasts) : next;
    });

    const timeout = options.timeout ?? this.config.timeout;

    if (timeout > 0) {
      this.timers.set(
        id,
        setTimeout(() => this.dismiss(id), timeout)
      );
    }

    return id;
  }

  runAction(id: number): void {
    this._toasts()
      .find(toast => toast.id === id)
      ?.onAction?.();
    this.dismiss(id);
  }

  dismiss(id: number): void {
    const timer = this.timers.get(id);

    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }

    this._toasts.update(list => list.filter(toast => toast.id !== id));
  }

  clear(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this._toasts.set([]);
    this.ref?.close();
    this.ref = null;
  }

  private ensureMounted(): void {
    if (this.ref) {
      return;
    }

    this.ref = this.overlay.open(XuiToastContainer, {
      position: 'global',
      globalPosition: toastGlobalPosition(this.position()),
      hasBackdrop: false,
      // The page must stay usable while a toast is up — no scroll lock, and the
      // pane lets clicks through except on the toasts themselves.
      scrollStrategy: 'noop',
      closeOnEscape: false,
      closeOnOutsideClick: false,
      restoreFocus: false,
      panelClass: 'pointer-events-none'
    });
  }
}
