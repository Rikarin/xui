import type { BooleanInput } from '@angular/cdk/coercion';
import { Directive, ElementRef, booleanAttribute, computed, effect, inject, input, untracked } from '@angular/core';
import { xui } from '@xui/core';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

export const textareaVariants = cva(
  'flex w-full rounded-lg border border-border bg-surface-inset text-foreground placeholder:text-foreground-subtle transition-colors focus:border-focus focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&.ng-invalid.ng-touched]:border-error [&.ng-invalid.ng-touched]:border-2',
  {
    variants: {
      size: {
        md: 'min-h-16 px-(--control-padding-md) py-1.5 text-sm',
        sm: 'min-h-12 px-(--control-padding-sm) py-1 text-xs',
        lg: 'min-h-20 px-(--control-padding-lg) py-2 text-base'
      },
      resize: {
        true: 'resize-y',
        false: 'resize-none'
      }
    },
    defaultVariants: { size: 'md', resize: true }
  }
);

export type XuiTextareaVariants = VariantProps<typeof textareaVariants>;

/**
 * Styles a native `<textarea>` and, on request, grows it to fit its content.
 *
 * ```html
 * <textarea xuiTextarea placeholder="Notes"></textarea>
 * <textarea xuiTextarea autoResize [(ngModel)]="bio"></textarea>
 * ```
 *
 * A directive on the real element, so `ngModel`/`formControl`, validation and
 * the `ng-invalid.ng-touched` error styling all come from Angular's own textarea
 * support — this only dresses it. `autoResize` measures `scrollHeight` after
 * each input and pins the height to it, and turns manual resizing off (the two
 * would fight).
 */
@Directive({
  selector: 'textarea[xuiTextarea]',
  host: {
    '[class]': 'computedClass()',
    '(input)': 'resize()'
  }
})
export class XuiTextarea {
  private readonly host: HTMLTextAreaElement = inject(ElementRef).nativeElement;

  /** The user-defined classes. Merged last so they win over the variant classes. */
  readonly class = input<ClassValue>('');
  readonly size = input<XuiTextareaVariants['size']>('md');

  /** Grow to fit the content instead of scrolling; disables manual resize. */
  readonly autoResize = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  protected readonly computedClass = computed(() =>
    xui(textareaVariants({ size: this.size(), resize: !this.autoResize() }), this.class())
  );

  constructor() {
    // Fit on turn-on and whenever autoResize toggles; `input` handles typing.
    effect(() => {
      if (this.autoResize()) {
        untracked(() => this.resize());
      }
    });
  }

  /** Pin the height to the content. Public so a consumer can call it after setting the value in code. */
  resize(): void {
    if (!this.autoResize()) {
      return;
    }

    // Collapse first so a shrink is measured, not just growth.
    this.host.style.height = 'auto';
    this.host.style.height = `${this.host.scrollHeight}px`;
  }
}
