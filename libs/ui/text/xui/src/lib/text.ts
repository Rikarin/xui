import type { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, effect, ElementRef, inject, input, signal } from '@angular/core';
import { xui } from '@xui/core';
import { injectXElementSize } from '@xui/core/interactions';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { injectXuiTextConfig } from './text.token';

export const textVariants = cva('', {
  variants: {
    color: {
      default: 'text-foreground',
      muted: 'text-foreground-muted',
      subtle: 'text-foreground-subtle',
      primary: 'text-primary',
      success: 'text-success',
      error: 'text-error',
      warning: 'text-warning',
      info: 'text-info'
    },
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-md',
      base: 'text-base',
      lg: 'text-lg'
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold'
    },
    ellipsize: {
      true: 'block overflow-hidden text-ellipsis whitespace-nowrap',
      false: ''
    }
  },
  defaultVariants: {
    ellipsize: false
  }
});

export type XuiTextVariants = VariantProps<typeof textVariants>;

/**
 * Body text with optional truncation.
 *
 * ```html
 * <p xuiText color="muted">Secondary copy</p>
 * <span xuiText ellipsize>A long value that gets a tooltip when it overflows</span>
 * ```
 *
 * When `ellipsize` is set the host also gets a `title` holding its own text, but
 * only while the content actually overflows — a `title` on text that fits would
 * produce a tooltip repeating what the user can already read. Overflow is
 * re-measured whenever the element resizes.
 */
@Directive({
  selector: '[xuiText]',
  exportAs: 'xuiText',
  host: {
    '[class]': 'computedClass()',
    '[attr.title]': 'resolvedTitle()'
  }
})
export class XuiText {
  private readonly element: HTMLElement = inject(ElementRef).nativeElement;
  private readonly observedSize = injectXElementSize();
  private readonly overflowing = signal(false);
  private readonly config = injectXuiTextConfig();

  /** The user-defined classes. Merged last so they win over the variant classes. */
  readonly class = input<ClassValue>('');
  // The configured defaults are themselves undefined unless the app provides them,
  // so unconfigured text keeps inheriting from its surroundings.
  readonly color = input<XuiTextVariants['color']>(this.config.color);
  readonly size = input<XuiTextVariants['size']>(this.config.size);
  readonly weight = input<XuiTextVariants['weight']>(this.config.weight);

  /** Truncate with an ellipsis instead of wrapping. */
  readonly ellipsize = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /** An explicit title, which always wins over the generated overflow title. */
  readonly title = input<string | null>(null);

  protected readonly resolvedTitle = computed(
    () => this.title() ?? (this.overflowing() ? this.element.textContent?.trim() || null : null)
  );

  protected readonly computedClass = computed(() =>
    xui(
      textVariants({
        color: this.color(),
        size: this.size(),
        weight: this.weight(),
        ellipsize: this.ellipsize()
      }),
      this.class()
    )
  );

  constructor() {
    effect(() => {
      // Depend on the observed size so a resize re-runs the measurement.
      this.observedSize();
      this.ellipsize();

      this.remeasure();
    });
  }

  /**
   * Re-check whether the content overflows.
   *
   * Called automatically when the element resizes. Call it yourself after
   * changing the text inside a box whose size did not change — measuring on
   * every render instead would mean a `scrollWidth` read per instance per change
   * detection cycle, which is exactly the reflow cost that makes long lists slow.
   */
  remeasure(): void {
    if (!this.ellipsize()) {
      this.overflowing.set(false);

      return;
    }

    this.overflowing.set(this.element.scrollWidth > this.element.clientWidth);
  }
}
