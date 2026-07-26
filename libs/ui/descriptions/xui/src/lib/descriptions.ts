import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  input,
  numberAttribute,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';
import { XuiDescriptionsItem } from './descriptions-item';

/**
 * A key/value description list laid out on a grid. Wrap
 * `<xui-descriptions-item label="…">value</xui-descriptions-item>` entries;
 * `column` sets how many per row, `orientation` stacks or inlines the label, and
 * `bordered` draws a boxed, table-like variant.
 *
 * ```html
 * <xui-descriptions title="Order" [column]="2" bordered>
 *   <xui-descriptions-item label="ID">#1024</xui-descriptions-item>
 *   <xui-descriptions-item label="Status">Shipped</xui-descriptions-item>
 * </xui-descriptions>
 * ```
 */
@Component({
  selector: 'xui-descriptions',
  imports: [NgTemplateOutlet],
  template: `
    @if (title()) {
      <div [class]="titleClass()">{{ title() }}</div>
    }
    <div [class]="gridClass()" [style.grid-template-columns]="templateColumns()">
      @for (item of items(); track $index) {
        <div [class]="cellClass()" [style.grid-column]="'span ' + clampSpan(item.span())">
          <span [class]="labelClass()">{{ item.label() }}</span>
          <span [class]="valueClass()"><ng-container [ngTemplateOutlet]="item.content()" /></span>
        </div>
      }
    </div>
  `,
  host: {
    '[class]': 'computedClass()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiDescriptions {
  readonly class = input<ClassValue>('');

  readonly title = input<string>('');
  /** Number of items per row. */
  readonly column = input<number, NumberInput>(3, { transform: numberAttribute });
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly bordered = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  protected readonly items = contentChildren(XuiDescriptionsItem);

  protected clampSpan(span: number): number {
    return Math.max(1, Math.min(this.column(), span));
  }

  protected readonly templateColumns = computed(() => `repeat(${this.column()}, minmax(0, 1fr))`);

  protected readonly computedClass = computed(() =>
    xui('block text-sm', this.bordered() && 'border-border overflow-hidden rounded-lg border', this.class())
  );
  /**
   * Bordered, the title is the box's header rather than a line of text above the grid: the border
   * is on the host, so a bare title would sit against the corner of it with the gap below showing
   * through. It takes the cells' own padding and a rule under it, and the box reads as one surface.
   */
  protected readonly titleClass = computed(() =>
    xui('text-foreground font-semibold', this.bordered() ? 'bg-surface border-border border-b px-4 py-2.5' : 'mb-2')
  );
  protected readonly gridClass = computed(() =>
    xui('grid', this.bordered() ? 'bg-border gap-px [&>*]:bg-surface' : 'gap-x-6 gap-y-3')
  );
  protected readonly cellClass = computed(() =>
    xui(this.orientation() === 'vertical' ? 'flex flex-col gap-1' : 'flex gap-2', this.bordered() && 'px-4 py-2.5')
  );
  protected readonly labelClass = computed(() =>
    xui(
      'text-foreground-muted',
      this.orientation() === 'horizontal' && 'shrink-0',
      this.orientation() === 'horizontal' && !this.bordered() && 'after:content-[":"]',
      this.bordered() && 'font-medium'
    )
  );
  protected readonly valueClass = computed(() => xui('text-foreground min-w-0'));
}
