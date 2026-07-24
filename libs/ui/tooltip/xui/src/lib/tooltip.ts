import type { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
  DestroyRef,
  Directive,
  ElementRef,
  TemplateRef,
  booleanAttribute,
  effect,
  inject,
  input,
  numberAttribute,
  signal,
  untracked
} from '@angular/core';
import { uniqueId } from '@xui/core/a11y';
import { injectXOverlay, type XOverlayRef, type XPlacement } from '@xui/core/overlay';
import { XUI_TOOLTIP_CONTENT } from './tooltip-content';
import { XuiTooltipPanel } from './tooltip-panel';
import { injectXuiTooltipConfig, type XuiTooltipIntent } from './tooltip.token';

/**
 * A hint that floats over an element on hover or focus.
 *
 * ```html
 * <button xuiButton [xuiTooltip]="'Delete forever'" intent="error">Delete</button>
 * ```
 *
 * A preset built on the same `@xui/core/overlay` foundation as `@xui/popover`,
 * not on the popover directive itself: a tooltip is non-interactive (its panel
 * ignores the pointer), opens on focus for keyboard users, and describes rather
 * than labels — so the trigger points `aria-describedby` at it while it is open.
 *
 * Content is a string or a `TemplateRef`. Empty content never opens, so a
 * tooltip bound to a maybe-empty expression stays quiet rather than flashing an
 * empty chip.
 */
@Directive({
  selector: '[xuiTooltip]',
  exportAs: 'xuiTooltip',
  host: {
    '[attr.aria-describedby]': 'isOpen() ? panelId : null',
    '(pointerenter)': 'onEnter()',
    '(pointerleave)': 'onLeave()',
    '(focus)': 'onFocus()',
    '(blur)': 'onBlur()',
    '(keydown.escape)': 'onEscape()'
  }
})
export class XuiTooltip {
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly overlay = injectXOverlay();
  private readonly config = injectXuiTooltipConfig();

  protected readonly panelId = uniqueId('xui-tooltip');

  private ref: XOverlayRef | null = null;
  private openTimer: ReturnType<typeof setTimeout> | null = null;
  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  /** The hint. A string, or a template for rich content. Aliased to the selector. */
  readonly content = input.required<string | TemplateRef<unknown> | null | undefined>({ alias: 'xuiTooltip' });

  /** Values a template content destructures with `let-`. */
  readonly context = input<Record<string, unknown>>();

  readonly placement = input<XPlacement>(this.config.placement);
  readonly intent = input<XuiTooltipIntent>(this.config.intent);
  readonly compact = input<boolean, BooleanInput>(this.config.compact, { transform: booleanAttribute });
  readonly openOnTargetFocus = input<boolean, BooleanInput>(this.config.openOnTargetFocus, {
    transform: booleanAttribute
  });
  readonly offset = input<number, NumberInput>(this.config.offset, { transform: numberAttribute });
  readonly hoverOpenDelay = input<number, NumberInput>(this.config.hoverOpenDelay, { transform: numberAttribute });
  readonly hoverCloseDelay = input<number, NumberInput>(this.config.hoverCloseDelay, { transform: numberAttribute });

  /** A disabled tooltip never opens, and hides if it was showing. */
  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  private readonly openState = signal(false);

  /** Whether the tooltip is currently on screen. */
  readonly isOpen = this.openState.asReadonly();

  constructor() {
    // Hide as soon as the tooltip is disabled or its content empties out.
    effect(() => {
      if (this.disabled() || !this.hasContent()) {
        untracked(() => this.hide());
      }
    });

    inject(DestroyRef).onDestroy(() => {
      this.clearTimers();
      this.ref?.close();
    });
  }

  private hasContent(): boolean {
    const content = this.content();

    return content instanceof TemplateRef || (typeof content === 'string' && content.trim().length > 0);
  }

  private show(): void {
    if (this.ref || this.disabled() || !this.hasContent()) {
      return;
    }

    const ref = this.overlay.open(XuiTooltipPanel, {
      origin: this.host,
      placement: this.placement(),
      offset: this.offset(),
      role: null,
      // A tooltip is non-interactive, so it manages its own dismissal entirely
      // through hover/focus; an outside click is not its concern.
      closeOnOutsideClick: false,
      closeOnEscape: false,
      trapFocus: false,
      autoFocus: false,
      restoreFocus: false,
      providers: [
        {
          provide: XUI_TOOLTIP_CONTENT,
          useValue: {
            content: this.content() as string | TemplateRef<unknown>,
            context: this.context(),
            intent: this.intent(),
            compact: this.compact(),
            id: this.panelId
          }
        }
      ]
    });

    this.ref = ref;
    this.openState.set(true);

    // Only the current ref folds its dismissal back — a hide-then-show in the
    // same tick replaces it, and the stale ref's late `closed` must not win.
    void ref.closed.then(() => {
      if (this.ref === ref) {
        this.ref = null;
        untracked(() => this.openState.set(false));
      }
    });
  }

  private hide(): void {
    this.clearTimers();

    // Null synchronously so a re-show in the same tick does not see a stale ref.
    const ref = this.ref;
    this.ref = null;
    ref?.close();
  }

  // --- Interaction wiring -------------------------------------------------

  protected onEnter(): void {
    this.scheduleShow();
  }

  protected onLeave(): void {
    this.scheduleHide();
  }

  protected onFocus(): void {
    if (this.openOnTargetFocus()) {
      // Focus is deliberate; show at once rather than after the hover delay.
      this.cancelHide();
      this.show();
    }
  }

  protected onBlur(): void {
    this.hide();
  }

  protected onEscape(): void {
    // WAI-ARIA: Escape dismisses a tooltip without moving focus.
    this.hide();
  }

  private scheduleShow(): void {
    if (this.disabled()) {
      return;
    }

    this.cancelHide();
    this.openTimer ??= setTimeout(() => {
      this.openTimer = null;
      this.show();
    }, this.hoverOpenDelay());
  }

  private scheduleHide(): void {
    this.cancelShow();

    if (this.hoverCloseDelay() === 0) {
      this.hide();

      return;
    }

    this.closeTimer ??= setTimeout(() => {
      this.closeTimer = null;
      this.hide();
    }, this.hoverCloseDelay());
  }

  private cancelShow(): void {
    if (this.openTimer) {
      clearTimeout(this.openTimer);
      this.openTimer = null;
    }
  }

  private cancelHide(): void {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }

  private clearTimers(): void {
    this.cancelShow();
    this.cancelHide();
  }
}
