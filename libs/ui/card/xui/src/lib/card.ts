import type { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, input } from '@angular/core';
import { xui } from '@xui/core';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { injectXuiCardConfig } from './card.token';

export const cardVariants = cva('bg-surface-raised text-foreground block rounded-lg transition-shadow', {
  variants: {
    /** Drop-shadow depth. Maps 1:1 to Blueprint's `elevation` prop. */
    elevation: {
      0: 'shadow-elevation-0',
      1: 'shadow-elevation-1',
      2: 'shadow-elevation-2',
      3: 'shadow-elevation-3',
      4: 'shadow-elevation-4'
    },
    interactive: {
      true: 'cursor-pointer focus-visible:outline-5 focus-visible:outline-offset-2',
      false: ''
    },
    selected: {
      true: 'ring-primary ring-2',
      false: ''
    },
    compact: {
      true: 'p-3',
      false: 'p-5'
    }
  },
  compoundVariants: [
    // An interactive card lifts one step on hover. Written per elevation
    // because Tailwind cannot compute "one step up" from a variable.
    { interactive: true, elevation: 0, class: 'hover:shadow-elevation-1' },
    { interactive: true, elevation: 1, class: 'hover:shadow-elevation-2' },
    { interactive: true, elevation: 2, class: 'hover:shadow-elevation-3' },
    { interactive: true, elevation: 3, class: 'hover:shadow-elevation-4' },
    { interactive: true, elevation: 4, class: 'hover:shadow-elevation-4' }
  ],
  defaultVariants: {
    elevation: 0,
    interactive: false,
    selected: false,
    compact: false
  }
});

export type CardVariants = VariantProps<typeof cardVariants>;
export type CardElevation = NonNullable<CardVariants['elevation']>;

/**
 * A bounded, elevated container for a single piece of content.
 *
 * ```html
 * <div xuiCard>…</div>
 * <button xuiCard interactive [selected]="isSelected()">…</button>
 * ```
 *
 * A directive rather than a component, so an interactive card can be a real
 * `<button>` or `<a>` and get keyboard activation and focus for free instead of
 * needing a click handler bolted onto a `<div>`.
 */
@Directive({
  selector: '[xuiCard]',
  exportAs: 'xuiCard',
  host: {
    '[class]': 'computedClass()',
    '[attr.aria-selected]': 'interactive() && selected() ? "true" : null'
  }
})
export class XuiCard {
  private readonly config = injectXuiCardConfig();

  /** The user-defined classes. Merged last so they win over the variant classes. */
  readonly class = input<ClassValue>('');
  readonly elevation = input<CardElevation>(this.config.elevation);

  /** Respond to hover and focus. Pair it with a `<button>` or `<a>` host. */
  readonly interactive = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /** Draw the selected ring. */
  readonly selected = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /** Reduce the internal padding. */
  readonly compact = input<boolean, BooleanInput>(this.config.compact, { transform: booleanAttribute });

  protected readonly computedClass = computed(() =>
    xui(
      cardVariants({
        elevation: this.elevation(),
        interactive: this.interactive(),
        selected: this.selected(),
        compact: this.compact()
      }),
      this.class()
    )
  );
}
