import type { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, input } from '@angular/core';
import { xui } from '@xui/core';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

export const cardListVariants = cva(
  [
    'bg-surface-raised text-foreground flex flex-col',
    // The children are cards, but inside a list they read as rows: strip their
    // own rounding and shadow and separate them with hairlines instead.
    '[&>*]:rounded-none [&>*]:shadow-none [&>*]:border-b [&>*]:border-border',
    '[&>*:last-child]:border-b-0'
  ],
  {
    variants: {
      bordered: {
        true: 'border-border shadow-elevation-1 overflow-hidden rounded-lg border',
        false: ''
      },
      compact: {
        true: '[&>*]:p-3',
        false: '[&>*]:p-4'
      }
    },
    defaultVariants: {
      bordered: true,
      compact: false
    }
  }
);

export type CardListVariants = VariantProps<typeof cardListVariants>;

/**
 * A vertical list of cards rendered as flush rows.
 *
 * ```html
 * <div xuiCardList>
 *   <button xuiCard interactive>First</button>
 *   <button xuiCard interactive>Second</button>
 * </div>
 * ```
 *
 * `compact` cascades to every row, so the child cards do not each need setting.
 *
 * Set `[bordered]="false"` when nesting inside another bordered container such
 * as a section card, which already supplies the frame.
 */
@Directive({
  selector: '[xuiCardList]',
  exportAs: 'xuiCardList',
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiCardList {
  /** The user-defined classes. Merged last so they win over the variant classes. */
  readonly class = input<ClassValue>('');

  /** Draw the surrounding frame. Turn it off when nesting inside one. */
  readonly bordered = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

  /** Reduce the padding of every row. */
  readonly compact = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  protected readonly computedClass = computed(() =>
    xui(cardListVariants({ bordered: this.bordered(), compact: this.compact() }), this.class())
  );
}
