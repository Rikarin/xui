import { ChangeDetectionStrategy, Component, Injectable, computed, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matCheckCircleRound, matErrorRound, matInfoRound, matWarningRound } from '@ng-icons/material-icons/round';
import { XuiButtonImports } from '@xui/button';
import { XuiDialogFooter, XuiDialogRef, XuiDialogService } from '@xui/dialog';
import { XuiIcon } from '@xui/icon';
import {
  XUI_ALERT_COLOR_ICON,
  XUI_ALERT_COLOR_ICON_CLASS,
  XUI_ALERT_OPTIONS,
  alertConfirmColor,
  type XuiAlertOptions
} from './alert-config';

/**
 * The body rendered by `XuiAlertService`. Not exported — the service is the
 * only thing that mounts it, and it closes the dialog with the boolean result
 * the promise resolves to.
 */
@Component({
  selector: 'xui-confirm-dialog',
  imports: [NgIcon, XuiIcon, XuiButtonImports, XuiDialogFooter],
  viewProviders: [provideIcons({ matInfoRound, matCheckCircleRound, matWarningRound, matErrorRound })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex gap-3 px-6 py-6">
      @if (resolvedIcon()) {
        <ng-icon xui size="xl" [name]="resolvedIcon()!" [class]="iconClass()" class="shrink-0" />
      }
      <div class="text-foreground pt-0.5 text-sm">{{ options.message }}</div>
    </div>
    <xui-dialog-footer>
      @if (options.cancelText) {
        <button xuiButton variant="ghost" (click)="close(false)">{{ options.cancelText }}</button>
      }
      <button xuiButton [color]="confirmColor()" (click)="close(true)">{{ options.confirmText ?? 'Confirm' }}</button>
    </xui-dialog-footer>
  `
})
export class XuiConfirmDialog {
  protected readonly options = inject(XUI_ALERT_OPTIONS);
  private readonly ref = inject<XuiDialogRef<boolean>>(XuiDialogRef);

  private readonly color = this.options.color ?? 'none';
  protected readonly resolvedIcon = computed(() =>
    this.options.icon === undefined ? XUI_ALERT_COLOR_ICON[this.color] : this.options.icon
  );
  protected readonly iconClass = computed(() => XUI_ALERT_COLOR_ICON_CLASS[this.color]);
  protected readonly confirmColor = computed(() => alertConfirmColor(this.color));

  protected close(result: boolean): void {
    this.ref.close(result);
  }
}

/**
 * Opens a confirmation from code and resolves to the user's answer.
 *
 * ```ts
 * if (await this.alerts.confirm({ message: 'Delete this?', color: 'error', confirmText: 'Delete', cancelText: 'Cancel' })) {
 *   this.remove();
 * }
 * ```
 *
 * A thin layer over `XuiDialogService` that mounts a fixed confirm/cancel body
 * and settles its promise `true` on confirm, `false` on cancel or any dismissal
 * — so a caller can simply `await` the answer.
 */
@Injectable({ providedIn: 'root' })
export class XuiAlertService {
  private readonly dialogs = inject(XuiDialogService);

  async confirm(options: XuiAlertOptions): Promise<boolean> {
    const ref = this.dialogs.open<XuiConfirmDialog, boolean>(XuiConfirmDialog, {
      size: 'sm',
      canEscapeKeyClose: options.canEscapeKeyClose ?? true,
      canOutsideClickClose: options.canOutsideClickClose ?? false,
      ariaLabel: options.message,
      providers: [{ provide: XUI_ALERT_OPTIONS, useValue: options }]
    });

    // A dismissal (Escape, backdrop) resolves `undefined`; treat it as declining.
    return (await ref.closed) === true;
  }
}
