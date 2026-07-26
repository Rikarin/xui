import { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  signal,
  untracked,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { injectXuiTableConfig } from './table.token';

// Display modifiers reach the rows/cells with descendant selectors so the flex
// layout of `xui-tr`/`xui-td`/`xui-th` stays untouched.
export const tableVariants = cva('flex flex-col text-sm [&_xui-tr:last-child]:border-0', {
  variants: {
    striped: { true: '[&_xui-tr:nth-child(even)]:bg-surface-inset/40', false: '' },
    bordered: {
      true: 'rounded-md border border-border [&_xui-td]:border-e [&_xui-th]:border-e [&_xui-td:last-child]:border-e-0 [&_xui-th:last-child]:border-e-0 [&_xui-td]:border-border [&_xui-th]:border-border',
      false: ''
    },
    interactive: { true: '[&_xui-tr]:cursor-pointer', false: '' },
    compact: { true: '[&_xui-td]:p-1.5 [&_xui-th]:p-1.5', false: '' }
  },
  defaultVariants: { striped: false, bordered: false, interactive: false, compact: false }
});

export type XuiTableVariants = VariantProps<typeof tableVariants>;

/**
 * A table laid out with flex rather than `table-layout`, so a column can grow while the rest stay
 * sized to their content and the row parts stay addressable for striping and selection.
 *
 * A cell is `flex-none` — it is as wide as what is in it — so a column lines up only when every
 * cell in it carries the same width. Give each `xui-th`/`xui-td` down a column the same width
 * class, and `grow` to the one that should absorb what is left; sized by their content, the rows
 * go ragged the moment the data varies.
 *
 * ```html
 * <xui-table class="w-96" bordered>
 *   <xui-tr><xui-th class="grow">Name</xui-th><xui-th class="w-24">Role</xui-th></xui-tr>
 *   <xui-tr><xui-td class="grow">Ada Lovelace</xui-td><xui-td class="w-24">Owner</xui-td></xui-tr>
 * </xui-table>
 * ```
 */
@Component({
  selector: 'xui-table',
  host: {
    '[class]': 'computedClass()',
    role: 'table',
    '[attr.aria-labelledby]': 'labeledBy()'
  },
  template: ` <ng-content /> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiTable {
  private readonly config = injectXuiTableConfig();

  readonly class = input<ClassValue>('');

  /** Alternate row background. */
  readonly striped = input<boolean, BooleanInput>(this.config.striped, { transform: booleanAttribute });
  /** Outer border plus dividers between cells. */
  readonly bordered = input<boolean, BooleanInput>(this.config.bordered, { transform: booleanAttribute });
  /** Show a pointer cursor on rows for clickable tables. */
  readonly interactive = input<boolean, BooleanInput>(this.config.interactive, { transform: booleanAttribute });
  /** Tighter cell padding. */
  readonly compact = input<boolean, BooleanInput>(this.config.compact, { transform: booleanAttribute });

  protected readonly computedClass = computed(() =>
    xui(
      tableVariants({
        striped: this.striped(),
        bordered: this.bordered(),
        interactive: this.interactive(),
        compact: this.compact()
      }),
      this.class()
    )
  );

  // eslint-disable-next-line
  readonly labeledByInput = input<string | null | undefined>(undefined, { alias: 'aria-labelledby' });
  readonly labeledBy = signal<string | null | undefined>(undefined);

  constructor() {
    effect(() => {
      const labeledBy = this.labeledByInput();

      untracked(() => {
        this.labeledBy.set(labeledBy);
      });
    });
  }
}
