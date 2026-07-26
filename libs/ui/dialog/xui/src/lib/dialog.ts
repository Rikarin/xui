import type { BooleanInput } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  booleanAttribute,
  computed,
  effect,
  input,
  model,
  untracked,
  viewChild
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matCloseRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import { uniqueId } from '@xui/core/a11y';
import { injectXOverlay, type XOverlayRef } from '@xui/core/overlay';
import { XuiIcon } from '@xui/icon';
import type { ClassValue } from 'clsx';
import { XUI_DIALOG_SIZES, injectXuiDialogConfig, type XuiDialogSize } from './dialog.token';

/**
 * A modal surface centred over a dimmed backdrop.
 *
 * ```html
 * <xui-dialog [(open)]="editing" title="Edit profile" icon="matPersonRound">
 *   <xui-dialog-body>…</xui-dialog-body>
 *   <xui-dialog-footer>
 *     <button xuiButton variant="ghost" (click)="editing.set(false)">Cancel</button>
 *     <button xuiButton (click)="save()">Save</button>
 *   </xui-dialog-footer>
 * </xui-dialog>
 * ```
 *
 * Declarative and controlled: it renders nothing until `open`, then attaches
 * its content to a modal overlay from `@xui/core/overlay` — backdrop, focus
 * trap, focus restore and page-scroll lock all come from there. For opening a
 * dialog imperatively from a service, see `XuiDialogService`.
 *
 * `open` is a model, so Escape, the backdrop and the close button fold their
 * dismissal back into the binding; the surface never contradicts the flag.
 */
@Component({
  selector: 'xui-dialog',
  imports: [NgIcon, XuiIcon],
  viewProviders: [provideIcons({ matCloseRound })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #surface>
      <div [class]="computedClass()">
        @if (title() || showCloseButton()) {
          <header class="border-border flex shrink-0 items-center gap-3 border-b px-6 py-4">
            @if (icon()) {
              <ng-icon xui size="lg" [name]="icon()" class="text-foreground-muted shrink-0" />
            }
            <h2 [id]="titleId" class="text-foreground min-w-0 flex-1 truncate text-base font-semibold">
              {{ title() }}
            </h2>
            @if (showCloseButton()) {
              <button
                type="button"
                class="text-foreground-muted hover:bg-hover-overlay hover:text-foreground -me-2 grid size-8 shrink-0 place-items-center rounded-md focus-visible:outline-5 focus-visible:outline-offset-2"
                aria-label="Close"
                (click)="close()"
              >
                <ng-icon xui size="md" name="matCloseRound" />
              </button>
            }
          </header>
        }

        <ng-content />
      </div>
    </ng-template>
  `
})
export class XuiDialog {
  private readonly overlay = injectXOverlay();
  private readonly config = injectXuiDialogConfig();
  private readonly surface = viewChild.required<TemplateRef<unknown>>('surface');

  protected readonly titleId = uniqueId('xui-dialog-title');
  private ref: XOverlayRef | null = null;

  /** The user-defined classes on the surface. Merged last so they win. */
  readonly class = input<ClassValue>('');
  readonly title = input<string | null>(null);
  readonly icon = input<string>();
  readonly size = input<XuiDialogSize>(this.config.size);

  readonly canEscapeKeyClose = input<boolean, BooleanInput>(this.config.canEscapeKeyClose, {
    transform: booleanAttribute
  });
  readonly canOutsideClickClose = input<boolean, BooleanInput>(this.config.canOutsideClickClose, {
    transform: booleanAttribute
  });
  readonly showCloseButton = input<boolean, BooleanInput>(this.config.showCloseButton, {
    transform: booleanAttribute
  });

  /** Open state. Works bound (controlled) or via `show()`/`close()`. */
  readonly open = model(false);

  protected readonly computedClass = computed(() =>
    xui(
      'bg-surface-raised text-foreground border-border flex max-h-[85vh] w-full flex-col overflow-hidden rounded-xl border shadow-overlay',
      XUI_DIALOG_SIZES[this.size()],
      this.class()
    )
  );

  constructor() {
    // The model is the single source of truth; the overlay follows it.
    effect(() => {
      const shouldOpen = this.open();

      untracked(() => (shouldOpen ? this.attach() : this.detach()));
    });
  }

  show(): void {
    this.open.set(true);
  }

  close(): void {
    this.open.set(false);
  }

  private attach(): void {
    if (this.ref) {
      return;
    }

    const ref = this.overlay.open(this.surface(), {
      position: 'global',
      hasBackdrop: true,
      backdropClass: 'bg-foreground/40',
      scrollStrategy: 'block',
      closeOnEscape: this.canEscapeKeyClose(),
      closeOnOutsideClick: false,
      closeOnBackdropClick: this.canOutsideClickClose(),
      trapFocus: true,
      autoFocus: true,
      restoreFocus: true,
      role: 'dialog',
      ariaLabelledBy: this.title() ? this.titleId : null
    });

    this.ref = ref;

    // Only fold an overlay-driven close (Escape, backdrop) back into the model.
    // A programmatic close nulls `this.ref` first, and a synchronous reopen
    // replaces it — so if this ref is no longer current, its close is stale.
    void ref.closed.then(() => {
      if (this.ref !== ref) {
        return;
      }

      this.ref = null;
      untracked(() => this.open.set(false));
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
