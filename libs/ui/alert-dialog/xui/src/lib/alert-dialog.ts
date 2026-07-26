import type { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  model,
  output,
  TemplateRef,
  untracked,
  viewChild,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import { uniqueId } from '@xui/core/a11y';
import { injectXOverlay, type XOverlayRef } from '@xui/core/overlay';
import { cva } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

const actionVariants = cva(
  [
    'inline-flex items-center justify-center rounded-md text-sm font-medium outline-none',
    'h-(--control-height-md) px-(--control-padding-md)',
    'focus-visible:ring-2'
  ],
  {
    variants: {
      intent: {
        cancel: 'border-border text-foreground hover:bg-surface-inset border focus-visible:ring-focus',
        primary:
          'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary focus-visible:ring-offset-1',
        destructive:
          'bg-error text-error-foreground hover:bg-error/90 focus-visible:ring-error focus-visible:ring-offset-1'
      }
    },
    defaultVariants: {
      intent: 'primary'
    }
  }
);

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
 *   confirmText="Delete"
 *   (confirmed)="remove()" />
 * ```
 *
 * A thin preset over the same modal overlay `XuiDialog` uses: it renders
 * nothing until `open`, then attaches its surface to `@xui/core/overlay` —
 * backdrop, focus trap, background `inert`, focus restore and page-scroll lock
 * all come from there. Initial focus lands on the (safe) Cancel button; Escape
 * and a backdrop click cancel only while `dismissible`.
 */
@Component({
  selector: 'xui-alert-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <ng-template #surface>
      <div [class]="computedClass()">
        <h2 [id]="titleId" class="text-foreground text-lg font-semibold">{{ title() }}</h2>
        <div [id]="descriptionId" class="text-foreground-muted mt-2 text-sm">
          {{ description() }}
          <ng-content />
        </div>
        <div class="mt-5 flex justify-end gap-2">
          <button type="button" cdkFocusInitial [class]="cancelClass()" (click)="cancel()">{{ cancelText() }}</button>
          <button type="button" [class]="confirmClass()" (click)="confirm()">{{ confirmText() }}</button>
        </div>
      </div>
    </ng-template>
  `
})
export class XuiAlertDialog {
  private readonly overlay = injectXOverlay();
  private readonly destroyRef = inject(DestroyRef);
  private readonly surface = viewChild.required<TemplateRef<unknown>>('surface');

  protected readonly titleId = uniqueId('xui-alert-dialog-title');
  protected readonly descriptionId = uniqueId('xui-alert-dialog-description');
  private ref: XOverlayRef | null = null;
  private destroyed = false;

  /** The user-defined classes on the panel. Merged last so they win. */
  readonly class = input<ClassValue>('');
  readonly open = model<boolean>(false);
  readonly title = input<string>('');
  readonly description = input<string>('');
  readonly confirmText = input<string>('Confirm');
  readonly cancelText = input<string>('Cancel');
  readonly destructive = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  /** Allow Escape and a backdrop click to dismiss (as a cancel). */
  readonly dismissible = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  protected readonly computedClass = computed(() =>
    xui(
      'border-border bg-surface-overlay text-foreground shadow-overlay w-full max-w-sm rounded-lg border p-5',
      this.class()
    )
  );
  protected readonly cancelClass = computed(() => xui(actionVariants({ intent: 'cancel' })));
  protected readonly confirmClass = computed(() =>
    xui(actionVariants({ intent: this.destructive() ? 'destructive' : 'primary' }))
  );

  constructor() {
    this.destroyRef.onDestroy(() => (this.destroyed = true));

    // The model is the single source of truth; the overlay follows it.
    effect(() => {
      const shouldOpen = this.open();

      untracked(() => (shouldOpen ? this.attach() : this.detach()));
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

  private attach(): void {
    if (this.ref) {
      return;
    }

    const dismissible = this.dismissible();

    const ref = this.overlay.open(this.surface(), {
      position: 'global',
      hasBackdrop: true,
      backdropClass: 'bg-foreground/40',
      scrollStrategy: 'block',
      closeOnEscape: dismissible,
      closeOnOutsideClick: false,
      closeOnBackdropClick: dismissible,
      trapFocus: true,
      autoFocus: true,
      restoreFocus: true,
      role: 'alertdialog',
      ariaLabelledBy: this.titleId,
      ariaDescribedBy: this.descriptionId
    });

    this.ref = ref;

    // An overlay-driven close (Escape, backdrop click) is a cancel; fold it back
    // into the model and report it. A programmatic close nulls `this.ref` first,
    // and a synchronous reopen replaces it — so if this ref is no longer current,
    // its close is stale. On destroy the factory closes the overlay too; that is
    // teardown, not the user cancelling.
    void ref.closed.then(() => {
      if (this.ref !== ref || this.destroyed) {
        return;
      }

      this.ref = null;
      untracked(() => {
        this.open.set(false);
        this.cancelled.emit();
      });
    });
  }

  private detach(): void {
    const ref = this.ref;
    // Null synchronously so a reopen in the same tick does not see a stale ref
    // that its `closed` microtask would later clear out from under it.
    this.ref = null;
    ref?.close();
  }
}
