import { Directive, computed, input } from '@angular/core';
import { xui } from '@xui/core';
import { type VariantProps, cva } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

export const inputErrorVariants = cva('text-error text-sm font-medium', {
  variants: {},
  defaultVariants: {}
});
export type InputErrorVariants = VariantProps<typeof inputErrorVariants>;

// TODO: is this component necessary?
@Directive({
  selector: '[xuiInputError]',
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiInputErrorDirective {
  readonly class = input<ClassValue>('');

  protected computedClass = computed(() => xui(inputErrorVariants(), this.class()));
}
