import { Directive, computed, inject, input, signal } from '@angular/core';
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
export type LabelVariants = VariantProps<typeof labelVariants>;

@Directive({
  selector: '[xuiLabel]',
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

  readonly class = input<ClassValue>('');
  readonly variant = input<LabelVariants['variant']>('default');
  readonly error = input<LabelVariants['error']>('auto');

  protected readonly state = computed(() => ({
    error: signal(this.error())
  }));

  protected readonly computedClass = computed(() =>
    xui(
      labelVariants({
        variant: this.variant(),
        error: this.state().error(),
        disabled: this.xLabel?.dataDisabled() ?? 'auto'
      }),
      this.class()
    )
  );

  setError(error: LabelVariants['error']): void {
    this.state().error.set(error);
  }
}
