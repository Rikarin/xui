import type { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, input } from '@angular/core';
import { xui } from '@xui/core';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

export const dividerVariants = cva('border-border', {
  variants: {
    orientation: {
      horizontal: 'block w-auto border-t',
      vertical: 'inline-block h-auto self-stretch border-l'
    },
    compact: { true: '', false: '' }
  },
  compoundVariants: [
    { orientation: 'horizontal', compact: false, class: 'my-2' },
    { orientation: 'vertical', compact: false, class: 'mx-2' }
  ],
  defaultVariants: {
    orientation: 'horizontal',
    compact: false
  }
});

export type DividerVariants = VariantProps<typeof dividerVariants>;

/**
 * A rule separating two groups of content.
 *
 * ```html
 * <div xuiDivider></div>
 * <div xuiDivider orientation="vertical"></div>
 * ```
 *
 * The host is exposed as `role="separator"` with a matching `aria-orientation`,
 * so the break is announced rather than being purely visual. A vertical divider
 * stretches to its flex parent's cross size instead of needing a set height.
 */
@Directive({
  selector: '[xuiDivider]',
  exportAs: 'xuiDivider',
  host: {
    role: 'separator',
    '[attr.aria-orientation]': 'orientation()',
    '[class]': 'computedClass()'
  }
})
export class XuiDivider {
  /** The user-defined classes. Merged last so they win over the variant classes. */
  readonly class = input<ClassValue>('');
  readonly orientation = input<NonNullable<DividerVariants['orientation']>>('horizontal');

  /** Drop the surrounding margin so the divider sits flush with its neighbours. */
  readonly compact = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  protected readonly computedClass = computed(() =>
    xui(dividerVariants({ orientation: this.orientation(), compact: this.compact() }), this.class())
  );
}
