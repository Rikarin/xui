import { Injectable, Type } from '@angular/core';
import { injectXOverlay, type XOverlayRef } from '@xui/core/overlay';
import { XUI_DIALOG_SIZES, injectXuiDialogConfig, type XuiDialogSize } from './dialog.token';

export interface XuiDialogOpenConfig {
  size?: XuiDialogSize;
  canEscapeKeyClose?: boolean;
  canOutsideClickClose?: boolean;
  ariaLabel?: string;
  /** Injector providers for the opened component — pass data in this way. */
  providers?: unknown[];
}

/**
 * A handle on an imperatively-opened dialog.
 *
 * The opened component injects it to dismiss itself and hand back a result:
 * `inject(XuiDialogRef).close(value)`. Awaiting `closed` is how a caller reads
 * that result — a confirm flow becomes `await ref.closed`.
 */
export class XuiDialogRef<R = unknown> {
  /** Wired by the service immediately after the overlay opens. */
  overlayRef!: XOverlayRef<R>;

  close(result?: R): void {
    this.overlayRef.close(result);
  }

  get closed(): Promise<R | undefined> {
    return this.overlayRef.closed;
  }
}

/**
 * Opens dialogs from code, without a `<xui-dialog>` in a template.
 *
 * ```ts
 * const ref = this.dialogs.open(EditProfileDialog, { providers: [{ provide: PROFILE, useValue: p }] });
 * const saved = await ref.closed;
 * ```
 *
 * The opened component is mounted on the same modal overlay the declarative
 * dialog uses — backdrop, focus trap and scroll lock included — and is expected
 * to lay out its own header/body/footer with the dialog parts. It injects
 * `XuiDialogRef` to close itself.
 */
@Injectable({ providedIn: 'root' })
export class XuiDialogService {
  private readonly overlay = injectXOverlay();
  private readonly config = injectXuiDialogConfig();

  open<T, R = unknown>(component: Type<T>, config: XuiDialogOpenConfig = {}): XuiDialogRef<R> {
    const size = config.size ?? this.config.size;
    const dialogRef = new XuiDialogRef<R>();

    const overlayRef = this.overlay.open<R>(component, {
      position: 'global',
      hasBackdrop: true,
      backdropClass: 'bg-foreground/40',
      scrollStrategy: 'block',
      closeOnEscape: config.canEscapeKeyClose ?? this.config.canEscapeKeyClose,
      closeOnOutsideClick: false,
      closeOnBackdropClick: config.canOutsideClickClose ?? this.config.canOutsideClickClose,
      trapFocus: true,
      autoFocus: true,
      restoreFocus: true,
      role: 'dialog',
      ariaLabel: config.ariaLabel ?? null,
      panelClass: [
        'bg-surface-raised',
        'text-foreground',
        'border-border',
        'flex',
        'max-h-[85vh]',
        'w-full',
        'flex-col',
        'overflow-hidden',
        'rounded-xl',
        'border',
        'shadow-overlay',
        XUI_DIALOG_SIZES[size]
      ],
      providers: [{ provide: XuiDialogRef, useValue: dialogRef }, ...(config.providers ?? [])]
    });

    dialogRef.overlayRef = overlayRef;

    return dialogRef;
  }
}
