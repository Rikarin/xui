import type { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, computed, input } from '@angular/core';
import { xui } from '@xui/core';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

const controlGroupVariants = cva('flex', {
  variants: {
    vertical: {
      // Collapse the radii and shared borders between adjacent controls so the
      // group reads as one unit, rounded only on its outer ends.
      false: 'flex-row *:not-first:rounded-l-none *:not-last:rounded-r-none *:not-first:-ml-px',
      true: 'flex-col *:not-first:rounded-t-none *:not-last:rounded-b-none *:not-first:-mt-px'
    },
    fill: {
      true: 'w-full *:flex-1',
      false: ''
    }
  },
  defaultVariants: { vertical: false, fill: false }
});

export type XuiControlGroupVariants = VariantProps<typeof controlGroupVariants>;

/**
 * Groups adjacent inputs and buttons into one seamless unit.
 *
 * ```html
 * <div xuiControlGroup>
 *   <input xuiInput placeholder="Search" />
 *   <button xuiButton>Go</button>
 * </div>
 * ```
 *
 * Collapses the rounding and doubled borders between neighbours — the group is
 * rounded only on its outer ends — and overlaps the shared 1px border with a
 * negative margin so it does not read as double-width. `fill` stretches the
 * children to share the width equally; `vertical` stacks them.
 */
@Directive({
  selector: '[xuiControlGroup]',
  exportAs: 'xuiControlGroup',
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiControlGroup {
  /** The user-defined classes. Merged last so they win over the variant classes. */
  readonly class = input<ClassValue>('');
  readonly vertical = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly fill = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  protected readonly computedClass = computed(() =>
    xui(controlGroupVariants({ vertical: this.vertical(), fill: this.fill() }), this.class())
  );
}
