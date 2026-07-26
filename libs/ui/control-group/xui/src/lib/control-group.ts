import type { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, computed, input } from '@angular/core';
import { xui } from '@xui/core';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { injectXuiControlGroupConfig } from './control-group.token';

export const controlGroupVariants = cva('flex', {
  variants: {
    orientation: {
      // Collapse the radii and shared borders between adjacent controls so the
      // group reads as one unit, rounded only on its outer ends.
      horizontal: 'flex-row *:not-first:rounded-s-none *:not-last:rounded-e-none *:not-first:-ms-px',
      vertical: 'flex-col *:not-first:rounded-t-none *:not-last:rounded-b-none *:not-first:-mt-px'
    },
    fill: {
      true: 'w-full *:flex-1',
      false: ''
    }
  },
  defaultVariants: { orientation: 'horizontal', fill: false }
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
 * children to share the width equally; `orientation="vertical"` stacks them.
 */
@Directive({
  selector: '[xuiControlGroup]',
  exportAs: 'xuiControlGroup',
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiControlGroup {
  private readonly config = injectXuiControlGroupConfig();

  /** The user-defined classes. Merged last so they win over the variant classes. */
  readonly class = input<ClassValue>('');
  /** Stack the controls in a row or a column. */
  readonly orientation = input<'horizontal' | 'vertical'>(this.config.orientation);
  /** Stretch the controls to share the group's width (or height) equally. */
  readonly fill = input<boolean, BooleanInput>(this.config.fill, { transform: booleanAttribute });

  protected readonly computedClass = computed(() =>
    xui(controlGroupVariants({ orientation: this.orientation(), fill: this.fill() }), this.class())
  );
}
