import { ChangeDetectionStrategy, Component, computed, input, output, ViewEncapsulation } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  matCheckCircleRound,
  matCloseRound,
  matErrorRound,
  matInfoRound,
  matWarningRound
} from '@ng-icons/material-icons/round';
import { XuiIcon } from '@xui/icon';
import { XUI_TOAST_COLOR_ICON, XUI_TOAST_COLOR_ICON_CLASS, type XuiToastColor } from './toast.token';

/** One live notice, as tracked by the toaster. */
export interface XuiToastData {
  readonly id: number;
  readonly message: string;
  readonly color: XuiToastColor;
  /** Override the icon the color implies. `null` shows none. */
  readonly icon?: string | null;
  /** Label for an optional action button. */
  readonly actionText?: string;
  readonly onAction?: () => void;
}

/**
 * A single toast notice. Presentational — the toaster owns the list, timers and
 * placement; this only renders one entry and reports the two things a user can
 * do to it: run its action, or dismiss it.
 */
@Component({
  selector: 'xui-toast',
  imports: [NgIcon, XuiIcon],
  viewProviders: [provideIcons({ matInfoRound, matCheckCircleRound, matWarningRound, matErrorRound, matCloseRound })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (resolvedIcon()) {
      <ng-icon xui size="md" [name]="resolvedIcon()!" [class]="iconClass()" class="mt-0.5 shrink-0" />
    }

    <p class="min-w-0 flex-1 text-sm break-words">{{ toast().message }}</p>

    @if (toast().actionText) {
      <button
        type="button"
        class="text-link -my-1 shrink-0 self-center rounded px-1 text-sm font-medium hover:underline"
        (click)="actionClicked.emit()"
      >
        {{ toast().actionText }}
      </button>
    }

    <button
      type="button"
      class="text-foreground-muted hover:bg-hover-overlay hover:text-foreground -me-1 -mt-1 grid size-6 shrink-0 place-items-center rounded"
      aria-label="Dismiss"
      (click)="dismissed.emit()"
    >
      <ng-icon xui size="sm" name="matCloseRound" />
    </button>
  `,
  host: {
    // Assertive would interrupt a screen reader; a toast is polite by nature.
    role: 'status',
    'aria-live': 'polite',
    class:
      'bg-surface-overlay text-foreground border-border pointer-events-auto flex w-80 items-start gap-2.5 rounded-lg border p-3 shadow-overlay'
  }
})
export class XuiToast {
  /**
   * The notification to render: its message, colour, icon and optional action. Normally supplied by the toast service
   * rather than bound by hand.
   */
  readonly toast = input.required<XuiToastData>();

  /** Emits when the toast's action button is pressed. */
  readonly actionClicked = output<void>();
  /** Emits when the toast is dismissed, whether by its close button or by timing out. */
  readonly dismissed = output<void>();

  protected readonly resolvedIcon = computed(() => {
    const t = this.toast();

    return t.icon === undefined ? XUI_TOAST_COLOR_ICON[t.color] : t.icon;
  });
  protected readonly iconClass = computed(() => XUI_TOAST_COLOR_ICON_CLASS[this.toast().color]);
}
