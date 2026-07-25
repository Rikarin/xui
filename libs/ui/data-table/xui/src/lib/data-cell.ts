import { Directive, inject, TemplateRef } from '@angular/core';
import type { XuiDataColumn } from './data-table.types';

/** Context passed to a `[xuiDataCell]` template. */
export interface XuiDataCellContext<T> {
  $implicit: T;
  row: T;
  column: XuiDataColumn<T>;
  value: unknown;
  rowIndex: number;
  colIndex: number;
}

/**
 * Marks an `<ng-template>` as the cell renderer for a {@link XuiDataTable}.
 *
 * ```html
 * <xui-data-table [data]="rows" [columns]="cols">
 *   <ng-template xuiDataCell let-value let-column="column">
 *     <span [class.font-mono]="column.id === 'id'">{{ value }}</span>
 *   </ng-template>
 * </xui-data-table>
 * ```
 */
@Directive({ selector: 'ng-template[xuiDataCell]' })
export class XuiDataCell<T = unknown> {
  readonly template = inject<TemplateRef<XuiDataCellContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(_dir: XuiDataCell<T>, _ctx: unknown): _ctx is XuiDataCellContext<T> {
    return true;
  }
}
