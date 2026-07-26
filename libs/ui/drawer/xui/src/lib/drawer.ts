import type { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  model,
  TemplateRef,
  untracked,
  viewChild,
  ViewEncapsulation
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matCloseRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import { uniqueId } from '@xui/core/a11y';
import { injectXOverlay, type XGlobalPosition, type XOverlayRef } from '@xui/core/overlay';
import { XuiIcon } from '@xui/icon';
import type { ClassValue } from 'clsx';
import { injectXuiDrawerConfig, type XuiDrawerPosition, type XuiDrawerSize } from './drawer.token';

const SIZE: Record<'horizontal' | 'vertical', Record<XuiDrawerSize, string>> = {
  horizontal: { sm: 'w-72', md: 'w-[28rem]', lg: 'w-[36rem]' },
  vertical: { sm: 'h-56', md: 'h-80', lg: 'h-[32rem]' }
};

const EDGE: Record<XuiDrawerPosition, { cross: string; border: string; pin: XGlobalPosition; from: string }> = {
  right: { cross: 'h-screen', border: 'border-s', pin: { top: '0', right: '0' }, from: 'translateX(100%)' },
  left: { cross: 'h-screen', border: 'border-e', pin: { top: '0', left: '0' }, from: 'translateX(-100%)' },
  top: { cross: 'w-screen', border: 'border-b', pin: { top: '0', left: '0' }, from: 'translateY(-100%)' },
  bottom: { cross: 'w-screen', border: 'border-t', pin: { bottom: '0', left: '0' }, from: 'translateY(100%)' }
};

/**
 * A panel that slides in from an edge of the screen.
 *
 * ```html
 * <xui-drawer [(open)]="filtersOpen" position="right" title="Filters">
 *   <div class="p-6">…</div>
 * </xui-drawer>
 * ```
 *
 * The drawer sibling of `@xui/dialog`: same modal overlay (backdrop, focus trap,
 * scroll lock, Escape/backdrop close, focus restore), but pinned to an edge and
 * sized on its sliding axis. It slides in with the Web Animations API — no
 * `@angular/animations` dependency — and respects `prefers-reduced-motion`.
 */
@Component({
  selector: 'xui-drawer',
  imports: [NgIcon, XuiIcon],
  viewProviders: [provideIcons({ matCloseRound })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <ng-template #surface>
      <div [class]="computedClass()">
        @if (title() || showCloseButton()) {
          <header class="border-border flex shrink-0 items-center gap-3 border-b px-6 py-4">
            <h2 [id]="titleId" class="text-foreground min-w-0 flex-1 truncate text-base font-semibold">
              {{ title() }}
            </h2>
            @if (showCloseButton()) {
              <button
                type="button"
                class="text-foreground-muted hover:bg-hover-overlay hover:text-foreground -me-2 grid size-8 shrink-0 place-items-center rounded-md"
                aria-label="Close"
                (click)="close()"
              >
                <ng-icon xui size="md" name="matCloseRound" />
              </button>
            }
          </header>
        }

        <div class="min-h-0 flex-1 overflow-auto"><ng-content /></div>
      </div>
    </ng-template>
  `
})
export class XuiDrawer {
  private readonly overlay = injectXOverlay();
  private readonly config = injectXuiDrawerConfig();
  private readonly surface = viewChild.required<TemplateRef<unknown>>('surface');

  protected readonly titleId = uniqueId('xui-drawer-title');
  private ref: XOverlayRef | null = null;

  /** The user-defined classes on the surface. Merged last so they win. */
  readonly class = input<ClassValue>('');
  readonly title = input<string | null>(null);
  readonly position = input<XuiDrawerPosition>(this.config.position);
  readonly size = input<XuiDrawerSize>(this.config.size);

  readonly canEscapeKeyClose = input<boolean, BooleanInput>(this.config.canEscapeKeyClose, {
    transform: booleanAttribute
  });
  readonly canOutsideClickClose = input<boolean, BooleanInput>(this.config.canOutsideClickClose, {
    transform: booleanAttribute
  });
  readonly showCloseButton = input<boolean, BooleanInput>(this.config.showCloseButton, {
    transform: booleanAttribute
  });

  readonly open = model(false);

  private readonly axis = computed<'horizontal' | 'vertical'>(() =>
    this.position() === 'left' || this.position() === 'right' ? 'horizontal' : 'vertical'
  );

  protected readonly computedClass = computed(() => {
    const edge = EDGE[this.position()];

    return xui(
      'bg-surface-raised text-foreground border-border flex flex-col shadow-overlay',
      edge.cross,
      edge.border,
      this.axis() === 'horizontal' ? SIZE.horizontal[this.size()] : SIZE.vertical[this.size()],
      this.class()
    );
  });

  constructor() {
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

    const edge = EDGE[this.position()];

    const ref = this.overlay.open(this.surface(), {
      position: 'global',
      globalPosition: edge.pin,
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
    this.slideIn(ref.pane, edge.from);

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
    this.ref = null;
    ref?.close();
  }

  private slideIn(pane: HTMLElement, from: string): void {
    // A transition from off-screen; skipped when the user asks for less motion.
    if (globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    pane.animate([{ transform: from }, { transform: 'none' }], { duration: 200, easing: 'ease-out' });
  }
}
