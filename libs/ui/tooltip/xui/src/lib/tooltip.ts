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
  model,
  numberAttribute,
  untracked
} from '@angular/core';
import { uniqueId } from '@xui/core/a11y';
import { createXHoverGate, injectXOverlay, type XOverlayRef, type XPlacement } from '@xui/core/overlay';
import { XUI_TOOLTIP_CONTENT } from './tooltip-content';
import { XuiTooltipPanel } from './tooltip-panel';
import { injectXuiTooltipConfig, type XuiTooltipColor } from './tooltip.token';

/**
 * A hint that floats over an element on hover or focus.
 *
 * ```html
 * <button xuiButton [xuiTooltip]="'Delete forever'" color="error">Delete</button>
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
    '[attr.aria-describedby]': 'open() ? panelId : null',
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

  /** The hint. A string, or a template for rich content. Aliased to the selector. */
  readonly content = input.required<string | TemplateRef<unknown> | null | undefined>({ alias: 'xuiTooltip' });

  /** Values a template content destructures with `let-`. */
  readonly context = input<Record<string, unknown>>();

  /** Preferred side and alignment relative to the target. The overlay flips it when there is no room. */
  readonly placement = input<XPlacement>(this.config.placement);
  /** Intent colour of the bubble. */
  readonly color = input<XuiTooltipColor>(this.config.color);
  /** Tighter padding and smaller text, for one-word hints. */
  readonly compact = input<boolean, BooleanInput>(this.config.compact, { transform: booleanAttribute });
  /** Also open when the target takes keyboard focus, so the hint is reachable without a pointer. */
  readonly openOnTargetFocus = input<boolean, BooleanInput>(this.config.openOnTargetFocus, {
    transform: booleanAttribute
  });
  /** Gap in pixels between the target and the bubble. */
  readonly offset = input<number, NumberInput>(this.config.offset, { transform: numberAttribute });
  /**
   * Milliseconds the pointer must rest on the target before the tooltip opens. Keeps it from firing on the way past.
   */
  readonly hoverOpenDelay = input<number, NumberInput>(this.config.hoverOpenDelay, { transform: numberAttribute });
  /** Milliseconds before the tooltip closes after the pointer leaves. */
  readonly hoverCloseDelay = input<number, NumberInput>(this.config.hoverCloseDelay, { transform: numberAttribute });

  /** A disabled tooltip never opens, and hides if it was showing. */
  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /**
   * Whether the tooltip is currently on screen. Two-way bindable: an external
   * write opens or closes the overlay, and hover/focus changes fold back out.
   */
  readonly open = model(false);

  /** Debounces hover show/hide; the default zero close delay hides synchronously. */
  private readonly hoverGate = createXHoverGate({
    openDelay: () => this.hoverOpenDelay(),
    closeDelay: () => this.hoverCloseDelay(),
    open: () => this.show(),
    close: () => this.hide()
  });

  constructor() {
    // The `open` model also drives the overlay, so a programmatic write
    // behaves exactly like hover/focus.
    effect(() => {
      const open = this.open();

      untracked(() => {
        if (open && !this.ref) {
          this.show();

          // show() refuses while disabled or empty; reflect the refusal back.
          if (!this.ref) {
            this.open.set(false);
          }
        } else if (!open && this.ref) {
          this.hide();
        }
      });
    });

    // Hide as soon as the tooltip is disabled or its content empties out.
    effect(() => {
      if (this.disabled() || !this.hasContent()) {
        untracked(() => this.hide());
      }
    });

    inject(DestroyRef).onDestroy(() => this.ref?.close());
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
            color: this.color(),
            compact: this.compact(),
            id: this.panelId
          }
        }
      ]
    });

    this.ref = ref;
    untracked(() => this.open.set(true));

    // Only the current ref folds its dismissal back — a hide-then-show in the
    // same tick replaces it, and the stale ref's late `closed` must not win.
    void ref.closed.then(() => {
      if (this.ref === ref) {
        this.ref = null;
        untracked(() => this.open.set(false));
      }
    });
  }

  private hide(): void {
    this.hoverGate.cancelPending();

    // Null synchronously so a re-show in the same tick does not see a stale ref.
    const ref = this.ref;
    this.ref = null;
    ref?.close();
    untracked(() => this.open.set(false));
  }

  // --- Interaction wiring -------------------------------------------------

  protected onEnter(): void {
    if (this.disabled()) {
      return;
    }

    this.hoverGate.scheduleOpen();
  }

  protected onLeave(): void {
    this.hoverGate.scheduleClose();
  }

  protected onFocus(): void {
    if (this.openOnTargetFocus()) {
      // Focus is deliberate; show at once rather than after the hover delay.
      this.hoverGate.cancelPending();
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
}
