import { Directive, computed, inject, input, linkedSignal } from '@angular/core';
import { xui } from '@xui/core';
import { XLabel } from '@xui/core/label';
import { type VariantProps, cva } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

// TODO: theme - disabled, etc.
export const labelVariants = cva(
  [
    'text-sm font-medium leading-none',
    '[&.ng-invalid.ng-touched]:text-error',
    '[&>[xuiInput]]:my-1 [&:has([xuiInput]:disabled)]:cursor-not-allowed [&:has([xuiInput]:disabled)]:opacity-70'
  ],
  {
    variants: {
      variant: {
        default: ''
      },
      error: {
        auto: '[&:has([xuiInput].ng-invalid.ng-touched)]:text-error',
        true: 'text-error'
      },
      disabled: {
        auto: '[&:has([xuiInput]:disabled)]:opacity-70',
        true: 'opacity-70',
        false: ''
      }
    },
    defaultVariants: {
      variant: 'default',
      error: 'auto'
    }
  }
);
export type XuiLabelVariants = VariantProps<typeof labelVariants>;

/**
 * Styles a `<label>` and keeps it in step with the control it names.
 *
 * ```html
 * <label xuiLabel for="email">Email</label>
 * <label xuiLabel>Email <input xuiInput /></label>
 * ```
 *
 * Composes `XLabel` from `@xui/core/label`, so it mirrors the bound control's `ng-invalid`/`ng-touched`
 * state and its `data-disabled`: an invalid, touched field turns its label red and a disabled one dims
 * it, with no binding on the label itself.
 */
@Directive({
  selector: '[xuiLabel]',
  exportAs: 'xuiLabel',
  hostDirectives: [
    {
      directive: XLabel,
      inputs: ['id']
    }
  ],
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiLabel {
  // TODO: check the implementation of this component

  private readonly xLabel = inject(XLabel, { host: true });

  /** Extra classes, merged into the directive's own rather than replacing them. */
  readonly class = input<ClassValue>('');
  /** Reserved for future label styles; `default` is currently the only one. */
  readonly variant = input<XuiLabelVariants['variant']>('default');
  /**
   * Whether to render the error appearance. `auto` (the default) follows the wrapped control's
   * `ng-invalid.ng-touched` state; `true` forces it on for a control the label cannot see.
   */
  readonly error = input<XuiLabelVariants['error']>('auto');

  /** Follows the `error` input until `setError` overrides it. */
  private readonly errorState = linkedSignal(this.error);

  protected readonly computedClass = computed(() =>
    xui(
      labelVariants({
        variant: this.variant(),
        error: this.errorState(),
        disabled: this.xLabel?.dataDisabled() ?? 'auto'
      }),
      this.class()
    )
  );

  setError(error: XuiLabelVariants['error']): void {
    this.errorState.set(error);
  }
}
