import type { BooleanInput } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  effect,
  input,
  model,
  output,
  untracked
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matCheckCircleRound, matErrorRound, matInfoRound, matWarningRound } from '@ng-icons/material-icons/round';
import { XuiButtonImports } from '@xui/button';
import { XuiDialogImports } from '@xui/dialog';
import { XuiIcon } from '@xui/icon';
import {
  XUI_ALERT_COLOR_ICON,
  XUI_ALERT_COLOR_ICON_CLASS,
  alertConfirmColor,
  type XuiAlertColor
} from './alert-config';

/**
 * A small modal that asks the user to confirm or cancel before something
 * irreversible.
 *
 * ```html
 * <xui-alert [(open)]="confirming" color="error" confirmText="Delete"
 *            cancelText="Cancel" (confirmed)="remove()">
 *   Delete this project? This cannot be undone.
 * </xui-alert>
 * ```
 *
 * A preset over `@xui/dialog`: no title bar, no close button, and a fixed pair
 * of actions. Dismissing it any other way — Escape, the backdrop — counts as a
 * cancel, so `(cancelled)` fires however the user backs out. For a promise-based
 * confirmation opened from code, use `XuiAlertService`.
 */
@Component({
  selector: 'xui-alert',
  imports: [NgIcon, XuiIcon, XuiButtonImports, XuiDialogImports],
  viewProviders: [provideIcons({ matInfoRound, matCheckCircleRound, matWarningRound, matErrorRound })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <xui-dialog
      [(open)]="open"
      size="sm"
      [showCloseButton]="false"
      [canEscapeKeyClose]="canEscapeKeyClose()"
      [canOutsideClickClose]="canOutsideClickClose()"
    >
      <div class="flex gap-3 px-6 py-6">
        @if (resolvedIcon()) {
          <ng-icon xui size="xl" [name]="resolvedIcon()!" [class]="iconClass()" class="shrink-0" />
        }
        <div class="text-foreground pt-0.5 text-sm"><ng-content /></div>
      </div>
      <xui-dialog-footer>
        @if (cancelText()) {
          <button xuiButton variant="ghost" (click)="cancel()">{{ cancelText() }}</button>
        }
        <button xuiButton [color]="confirmColor()" (click)="confirm()">{{ confirmText() }}</button>
      </xui-dialog-footer>
    </xui-dialog>
  `
})
export class XuiAlert {
  private wasOpen = false;
  private settled = false;

  readonly open = model(false);

  readonly color = input<XuiAlertColor>('none');
  /** Override the icon the color implies. Pass `null` to show none. */
  readonly icon = input<string | null | undefined>(undefined);

  readonly confirmText = input('Confirm');
  /** Omit for an acknowledge-only alert with no cancel button. */
  readonly cancelText = input<string | null>(null);

  readonly canEscapeKeyClose = input<boolean, BooleanInput>(true, { transform: booleanAttribute });
  readonly canOutsideClickClose = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  protected readonly resolvedIcon = computed(() => {
    const override = this.icon();

    return override === undefined ? XUI_ALERT_COLOR_ICON[this.color()] : override;
  });
  protected readonly iconClass = computed(() => XUI_ALERT_COLOR_ICON_CLASS[this.color()]);
  protected readonly confirmColor = computed(() => alertConfirmColor(this.color()));

  constructor() {
    // A close that is neither confirm nor cancel — Escape, the backdrop — is
    // still the user backing out, so report it as a cancel.
    effect(() => {
      const open = this.open();

      untracked(() => {
        if (open) {
          this.settled = false;
        } else if (this.wasOpen && !this.settled) {
          this.cancelled.emit();
        }

        this.wasOpen = open;
      });
    });
  }

  protected confirm(): void {
    this.settled = true;
    this.confirmed.emit();
    this.open.set(false);
  }

  protected cancel(): void {
    this.settled = true;
    this.cancelled.emit();
    this.open.set(false);
  }
}
