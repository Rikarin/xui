import type { BooleanInput } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  untracked
} from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';
import { XuiTable } from './table';

let captionIdSequence = 0;

/**
 * The table's accessible name.
 *
 * ```html
 * <xui-table>
 *   <xui-caption>Quarterly revenue by region</xui-caption>
 *   …
 * </xui-table>
 * ```
 *
 * Rendered last regardless of where it sits in the markup, and registered on the enclosing table as its
 * `aria-labelledby` — so the name reaches assistive technology even when `hidden` takes it off screen.
 */
@Component({
  selector: 'xui-caption',
  host: {
    '[class]': 'computedClass()',
    '[id]': 'id()'
  },
  template: `<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiCaption {
  private readonly table = inject(XuiTable, { optional: true });

  /**
   * Take the caption off screen while keeping it as the table's accessible name. Use it when the
   * surrounding page already carries a visible heading.
   */
  readonly hidden = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  /** Extra classes, merged into the component's own rather than replacing them. */
  readonly class = input<ClassValue>('');

  protected readonly id = input<string | null | undefined>(`${captionIdSequence++}`);
  protected readonly computedClass = computed(() =>
    xui('text-center block mt-4 text-sm text-foreground-subtle', this.hidden() ? 'sr-only' : 'order-last', this.class())
  );

  constructor() {
    effect(() => {
      const id = this.id();
      untracked(() => {
        if (!this.table) {
          return;
        }

        this.table.labeledBy.set(id);
      });
    });
  }
}
