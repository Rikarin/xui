import type { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
  DestroyRef,
  Directive,
  ElementRef,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  numberAttribute,
  output,
  untracked,
  type TemplateRef
} from '@angular/core';
import { injectXOverlay, type XOverlayRef, type XPlacement } from '@xui/core/overlay';
import type { ClassValue } from 'clsx';
import { XUI_POPOVER_CONTENT } from './popover-content';
import { XuiPopoverPanel } from './popover-panel';
import { injectXuiPopoverConfig, type XuiPopoverInteractionKind } from './popover.token';

/**
 * Anchors a floating panel to the element it sits on.
 *
 * ```html
 * <button xuiButton [xuiPopover]="menu">Actions</button>
 * <ng-template #menu>
 *   <div class="p-2">…</div>
 * </ng-template>
 * ```
 *
 * The trigger is whatever element carries the directive; the content is a
 * template so it stays lazy — nothing renders until the popover opens, and it
 * unmounts on close. `isOpen` is a model, so the popover works uncontrolled
 * (the directive toggles it) or controlled (bind `[isOpen]`).
 *
 * This is the base every other overlay preset composes: `tooltip` is a `hover`
 * popover with a preset panel, `menu` a `click` popover whose content is a menu.
 * All the lifecycle — Escape, outside-click, focus restoration, stacking — comes
 * from `@xui/core/overlay`, so it behaves identically everywhere.
 */
@Directive({
  selector: '[xuiPopover]',
  exportAs: 'xuiPopover',
  host: {
    '[attr.aria-expanded]': 'hasPopupRole() ? isOpen() : null',
    '[attr.aria-haspopup]': 'ariaHasPopup()',
    '(click)': 'onClick()',
    '(pointerenter)': 'onPointerEnter()',
    '(pointerleave)': 'onPointerLeave()'
  }
})
export class XuiPopover {
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly overlay = injectXOverlay();
  private readonly config = injectXuiPopoverConfig();

  private ref: XOverlayRef | null = null;
  private openTimer: ReturnType<typeof setTimeout> | null = null;
  private closeTimer: ReturnType<typeof setTimeout> | null = null;
  /** True while a hover is over the pane, so a trigger-leave does not close it. */
  private overPane = false;

  /** The content to float. Aliased so the selector doubles as the content input. */
  readonly content = input.required<TemplateRef<unknown>>({ alias: 'xuiPopover' });

  /** Values the content template destructures with `let-`. */
  readonly context = input<Record<string, unknown>>();

  readonly interactionKind = input<XuiPopoverInteractionKind>(this.config.interactionKind);
  readonly placement = input<XPlacement>(this.config.placement);
  readonly offset = input<number, NumberInput>(this.config.offset, { transform: numberAttribute });
  readonly hoverOpenDelay = input<number, NumberInput>(this.config.hoverOpenDelay, { transform: numberAttribute });
  readonly hoverCloseDelay = input<number, NumberInput>(this.config.hoverCloseDelay, { transform: numberAttribute });
  readonly minimal = input<boolean, BooleanInput>(this.config.minimal, { transform: booleanAttribute });
  readonly matchTargetWidth = input<boolean, BooleanInput>(this.config.matchTargetWidth, {
    transform: booleanAttribute
  });

  /** A disabled trigger never opens, and closes the popover if it was open. */
  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /** Extra classes for the floating surface. */
  readonly panelClass = input<ClassValue>('');

  /** ARIA role for the pane — `menu`, `listbox`, `dialog`. Null leaves it a plain group. */
  readonly role = input<'dialog' | 'menu' | 'listbox' | 'grid' | null>(null);
  readonly ariaLabel = input<string | null>(null);

  /** Open state. Works bound (controlled) or unbound (the directive toggles it). */
  readonly isOpen = model(false);

  readonly opened = output<void>();
  readonly closed = output<void>();

  private readonly hoverKind = computed(
    () => this.interactionKind() === 'hover' || this.interactionKind() === 'hover-target'
  );
  protected readonly hasPopupRole = computed(() => !this.hoverKind());
  protected readonly ariaHasPopup = computed(() => {
    if (this.hoverKind()) {
      return null;
    }

    return this.role() ?? 'true';
  });

  constructor() {
    // Single source of truth: the model drives the overlay. Interaction handlers
    // and controlled bindings both just move `isOpen`, and this reconciles.
    effect(() => {
      const shouldOpen = this.isOpen() && !this.disabled();

      untracked(() => (shouldOpen ? this.attach() : this.detach()));
    });

    inject(DestroyRef).onDestroy(() => this.clearTimers());
  }

  /** Toggle from a template, e.g. a dedicated open button. */
  toggle(): void {
    this.isOpen.set(!this.isOpen());
  }

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  private attach(): void {
    if (this.ref || this.disabled()) {
      return;
    }

    const hover = this.hoverKind();
    const minimal = this.minimal();

    const ref = this.overlay.open(XuiPopoverPanel, {
      origin: this.host,
      placement: this.placement(),
      offset: minimal ? 0 : this.offset(),
      matchOriginWidth: this.matchTargetWidth(),
      role: this.role(),
      ariaLabel: this.ariaLabel(),
      // Hover manages its own close; a click popover leans on the overlay.
      closeOnOutsideClick: !hover,
      closeOnEscape: true,
      // Give focus a home for click popovers (menus, dialogs); a hover card
      // must not steal focus from what the user is doing.
      trapFocus: !hover && this.role() != null,
      autoFocus: !hover && this.role() != null,
      restoreFocus: !hover,
      providers: [
        {
          provide: XUI_POPOVER_CONTENT,
          useValue: {
            template: this.content(),
            context: this.context(),
            minimal,
            fillWidth: this.matchTargetWidth(),
            panelClass: this.panelClass()
          }
        }
      ]
    });

    this.ref = ref;

    // The overlay can close itself (Escape, outside click). Fold that back into
    // the model so `isOpen` never lies about what is on screen. Only the current
    // ref folds — a programmatic close or a synchronous reopen has already moved
    // `this.ref` on, and a stale ref's late `closed` must not clobber it.
    void ref.closed.then(() => {
      this.overPane = false;

      if (this.ref === ref) {
        this.ref = null;
        untracked(() => this.isOpen.set(false));
      }

      this.closed.emit();
    });

    if (hover) {
      const pane = ref.pane;
      pane.addEventListener('pointerenter', this.onPaneEnter);
      pane.addEventListener('pointerleave', this.onPaneLeave);
    }

    this.opened.emit();
  }

  private detach(): void {
    this.clearTimers();

    // Null synchronously so a reopen in the same tick does not see a stale ref.
    const ref = this.ref;
    this.ref = null;
    ref?.close();
  }

  // --- Interaction wiring -------------------------------------------------

  protected onClick(): void {
    if (this.disabled() || this.hoverKind()) {
      return;
    }

    // `click-target` opens but never toggles shut from the trigger; only an
    // outside click or Escape closes it.
    if (this.interactionKind() === 'click-target') {
      this.open();

      return;
    }

    this.toggle();
  }

  protected onPointerEnter(): void {
    if (this.disabled() || !this.hoverKind()) {
      return;
    }

    this.cancelClose();
    this.scheduleOpen();
  }

  protected onPointerLeave(): void {
    if (!this.hoverKind()) {
      return;
    }

    this.cancelOpen();
    this.scheduleClose();
  }

  private readonly onPaneEnter = (): void => {
    // `hover-target` ignores pane hover, so reading the content cannot pin a
    // popover the pointer has already left the trigger for.
    if (this.interactionKind() !== 'hover') {
      return;
    }

    this.overPane = true;
    this.cancelClose();
  };

  private readonly onPaneLeave = (): void => {
    this.overPane = false;
    this.scheduleClose();
  };

  private scheduleOpen(): void {
    this.openTimer ??= setTimeout(() => {
      this.openTimer = null;
      this.open();
    }, this.hoverOpenDelay());
  }

  private scheduleClose(): void {
    this.cancelClose();
    this.closeTimer = setTimeout(() => {
      this.closeTimer = null;

      // The pointer may have crossed the gap into the pane in the meantime.
      if (!this.overPane) {
        this.close();
      }
    }, this.hoverCloseDelay());
  }

  private cancelOpen(): void {
    if (this.openTimer) {
      clearTimeout(this.openTimer);
      this.openTimer = null;
    }
  }

  private cancelClose(): void {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }

  private clearTimers(): void {
    this.cancelOpen();
    this.cancelClose();
  }
}
