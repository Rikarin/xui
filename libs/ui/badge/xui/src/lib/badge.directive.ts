import type { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, computed, input } from '@angular/core';
import { xui } from '@xui/core';
import { type VariantProps, cva } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

export const badgeVariants = cva(
  [
    'inline-flex items-center border rounded-full px-2.5 py-0.5 font-semibold transition-colors',
    'focus-visible:outline-5 focus-visible:outline-offset-2 transition-[outline]'
  ],
  {
    variants: {
      color: {
        primary: 'bg-primary border-transparent text-primary-foreground',
        secondary: 'bg-secondary border-transparent text-secondary-foreground',
        success: 'bg-success border-transparent text-success-foreground',
        error: 'bg-error border-transparent text-error-foreground',
        warning: 'bg-warning border-transparent text-warning-foreground',
        info: 'bg-info border-transparent text-info-foreground'
      },
      size: {
        md: 'text-xs',
        lg: 'text-sm'
      },
      static: { true: '', false: '' }
    },
    compoundVariants: [
      {
        color: 'primary',
        static: false,
        class: 'hover:bg-primary-darker'
      },
      {
        color: 'secondary',
        static: false,
        class: 'hover:bg-secondary-darker'
      },
      {
        color: 'success',
        static: false,
        class: 'hover:bg-success-darker'
      },
      {
        color: 'error',
        static: false,
        class: 'hover:bg-error-darker'
      },
      {
        color: 'warning',
        static: false,
        class: 'hover:bg-warning-darker'
      },
      {
        color: 'info',
        static: false,
        class: 'hover:bg-info-darker'
      }
    ],
    defaultVariants: {
      color: 'primary',
      size: 'md',
      static: false
    }
  }
);
export type BadgeVariants = VariantProps<typeof badgeVariants>;

@Directive({
  selector: '[xuiBadge]',
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiBadgeDirective {
  protected readonly computedClass = computed(() =>
    xui(badgeVariants({ color: this.color(), size: this.size(), static: this.static() }), this.class())
  );

  readonly class = input<ClassValue>('');
  readonly color = input<BadgeVariants['color']>('primary');
  readonly static = input<BadgeVariants['static'], BooleanInput>(false, { transform: booleanAttribute });
  readonly size = input<BadgeVariants['size']>('md');
}
