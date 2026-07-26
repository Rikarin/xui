import type { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, ElementRef, inject, input } from '@angular/core';
import { xui } from '@xui/core';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { injectXuiCardConfig } from './card.token';

export const cardVariants = cva('bg-surface-raised text-foreground block rounded-lg transition-shadow', {
  variants: {
    /** Drop-shadow depth, from flat to floating. Reads the `--elevation-*` tokens. */
    elevation: {
      0: 'shadow-elevation-0',
      1: 'shadow-elevation-1',
      2: 'shadow-elevation-2',
      3: 'shadow-elevation-3',
      4: 'shadow-elevation-4'
    },
    interactive: {
      true: 'cursor-pointer',
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

export type XuiCardVariants = VariantProps<typeof cardVariants>;
export type XuiCardElevation = NonNullable<XuiCardVariants['elevation']>;

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
    // `aria-selected` is only valid on a handful of roles (option, row, tab,
    // gridcell, treeitem) — on a plain button or link it is an invalid-attribute
    // violation. A toggling button is `aria-pressed`; a link marking the current
    // item is `aria-current`. An explicit `role` from the author wins.
    '[attr.aria-pressed]': 'selectedState() && !role && host === "button" ? "true" : null',
    '[attr.aria-current]': 'selectedState() && !role && host === "a" ? "true" : null',
    '[attr.aria-selected]': 'selectedState() && role ? "true" : null'
  }
})
export class XuiCard {
  private readonly config = injectXuiCardConfig();
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /** The host tag, so the selected state maps onto an attribute that role allows. */
  protected readonly host = this.element.tagName.toLowerCase();
  /** An author-supplied role takes over the naming of the selected state. */
  protected readonly role = this.element.getAttribute('role');

  /** The user-defined classes. Merged last so they win over the variant classes. */
  readonly class = input<ClassValue>('');
  /** Drop-shadow depth, from flat (`0`) to floating (`4`). An `interactive` card lifts one step on hover. */
  readonly elevation = input<XuiCardElevation>(this.config.elevation);

  /** Respond to hover and focus. Pair it with a `<button>` or `<a>` host. */
  readonly interactive = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /** Draw the selected ring. */
  readonly selected = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /** Reduce the internal padding. */
  readonly compact = input<boolean, BooleanInput>(this.config.compact, { transform: booleanAttribute });

  /** Only an interactive card has a selected state to announce. */
  protected readonly selectedState = computed(() => this.interactive() && this.selected());

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
