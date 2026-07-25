import { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  model,
  output,
  viewChild,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

/**
 * A modal confirmation dialog for a consequential choice — the kind you should
 * stop and read. Unlike a plain dialog it takes focus, blocks the page and asks
 * for an explicit Confirm / Cancel. `open` is two-way bindable; `confirmed` and
 * `cancelled` report the outcome. Set `destructive` to tint the confirm button.
 *
 * ```html
 * <xui-alert-dialog
 *   [(open)]="open"
 *   destructive
 *   title="Delete project?"
 *   description="This can't be undone."
 *   confirmLabel="Delete"
 *   (confirmed)="remove()" />
 * ```
 */
@Component({
  selector: 'xui-alert-dialog',
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
        <div class="absolute inset-0 bg-black/50" (click)="onBackdrop()"></div>

        <div
          role="alertdialog"
          aria-modal="true"
          [attr.aria-label]="title()"
          tabindex="-1"
          [class]="panelClass()"
          (keydown.escape)="onEscape()"
        >
          <h2 class="text-foreground text-lg font-semibold">{{ title() }}</h2>
          <div class="text-foreground-muted mt-2 text-sm">
            {{ description() }}
            <ng-content />
          </div>
          <div class="mt-5 flex justify-end gap-2">
            <button #cancelBtn type="button" [class]="cancelClass()" (click)="cancel()">{{ cancelLabel() }}</button>
            <button type="button" [class]="confirmClass()" (click)="confirm()">{{ confirmLabel() }}</button>
          </div>
        </div>
      </div>
    }
  `,
  host: {
    '[class]': 'computedClass()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiAlertDialog {
  readonly class = input<ClassValue>('');
  readonly open = model<boolean>(false);
  readonly title = input<string>('');
  readonly description = input<string>('');
  readonly confirmLabel = input<string>('Confirm');
  readonly cancelLabel = input<string>('Cancel');
  readonly destructive = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  /** Allow Escape and a backdrop click to dismiss (as a cancel). */
  readonly dismissible = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  private readonly cancelBtn = viewChild<ElementRef<HTMLButtonElement>>('cancelBtn');

  constructor() {
    // Move focus onto the (safe) Cancel button each time the dialog opens.
    effect(() => {
      const btn = this.cancelBtn();
      if (this.open() && btn) {
        btn.nativeElement.focus();
      }
    });
  }

  protected confirm(): void {
    this.open.set(false);
    this.confirmed.emit();
  }

  protected cancel(): void {
    this.open.set(false);
    this.cancelled.emit();
  }

  protected onBackdrop(): void {
    if (this.dismissible()) {
      this.cancel();
    }
  }

  protected onEscape(): void {
    if (this.dismissible()) {
      this.cancel();
    }
  }

  protected readonly computedClass = computed(() => xui('contents', this.class()));
  protected readonly panelClass = computed(() =>
    xui('border-border bg-surface-overlay shadow-overlay relative z-10 w-full max-w-sm rounded-lg border p-5')
  );
  protected readonly cancelClass = computed(() =>
    xui(
      'border-border text-foreground hover:bg-surface-inset h-9 rounded-md border px-4 text-sm font-medium outline-none focus-visible:ring-focus focus-visible:ring-2'
    )
  );
  protected readonly confirmClass = computed(() =>
    xui(
      'h-9 rounded-md px-4 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
      this.destructive()
        ? 'bg-error text-error-foreground hover:bg-error/90 focus-visible:ring-error'
        : 'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary'
    )
  );
}
