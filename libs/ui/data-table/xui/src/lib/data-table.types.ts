/** A column definition for {@link XuiDataTable}. */
export interface XuiDataColumn<T> {
  /** Stable id; also the default property key when `value` is omitted. */
  id: string;
  /** Header label. */
  header: string;
  /** Fixed initial width in pixels (else the table default). */
  width?: number;
  /** Whether clicking the header sorts by this column. */
  sortable?: boolean;
  /** Extract the cell value; defaults to `row[id]`. */
  value?: (row: T) => unknown;
  /** Text alignment of the cell content. */
  align?: 'left' | 'center' | 'right';
}

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  columnId: string;
  direction: SortDirection;
}

/** The currently focused cell, by data-row and column index. */
export interface CellCoord {
  row: number;
  col: number;
}
