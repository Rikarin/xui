import { NumberInput } from '@angular/cdk/coercion';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  effect,
  ElementRef,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  untracked,
  viewChild,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import { createGridSizeStore, indexAtPosition, visibleRange } from '@xui/core/grid';
import type { ClassValue } from 'clsx';
import { XuiDataCell } from './data-cell';
import type { CellCoord, SortState, XuiDataColumn } from './data-table.types';

/**
 * A virtualized data grid: only the visible rows are in the DOM, so it stays
 * smooth at 100k+ rows. Columns are resizable (drag the header divider) and
 * sortable; a focused cell can be moved with the arrow keys. Cells render with an
 * optional `[xuiDataCell]` template. Built on the pure `@xui/core/grid` model.
 */
@Component({
  selector: 'xui-data-table',
  imports: [NgTemplateOutlet],
  template: `
    <div
      #scroll
      role="grid"
      [attr.aria-rowcount]="displayData().length"
      [attr.aria-colcount]="columns().length"
      [class]="scrollClass()"
      [style.height.px]="height()"
      (scroll)="onScroll()"
      (keydown)="onKeydown($event)"
      tabindex="0"
    >
      <!-- Header row: sticks to the top, scrolls horizontally with the body. -->
      <div role="row" [class]="headerRowClass()" [style.height.px]="headerHeight()" [style.width.px]="totalWidth()">
        @for (column of columns(); track column.id; let c = $index) {
          <!-- Header sort is a pointer convenience; the grid container owns keyboard interaction. -->
          <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
          <div
            role="columnheader"
            [class]="headerCellClass(column)"
            [style.left.px]="columnOffset(c)"
            [style.width.px]="columnWidth(c)"
            [attr.aria-sort]="ariaSort(column)"
            (click)="onHeaderClick(column)"
          >
            <span class="truncate">{{ column.header }}</span>
            @if (sort()?.columnId === column.id) {
              <span class="text-foreground-muted ml-1 shrink-0 text-xs">{{
                sort()!.direction === 'asc' ? '▲' : '▼'
              }}</span>
            }
            <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
            <span
              class="hover:bg-primary/40 absolute top-0 right-0 h-full w-1 cursor-col-resize"
              (mousedown)="startResize(c, $event)"
              (click)="$event.stopPropagation()"
            ></span>
          </div>
        }
      </div>

      <!-- Body: a full-height spacer with only the visible rows absolutely placed. -->
      <div [class]="bodyClass()" [style.width.px]="totalWidth()" [style.height.px]="totalHeight()">
        @for (rowIndex of visibleRows(); track rowIndex) {
          <div
            role="row"
            [attr.aria-rowindex]="rowIndex + 1"
            class="absolute"
            [style.top.px]="rowOffset(rowIndex)"
            [style.height.px]="rowHeight()"
            [style.width.px]="totalWidth()"
          >
            @for (column of columns(); track column.id; let c = $index) {
              <!-- Cell focus is a pointer convenience; arrow-key navigation runs on the grid container. -->
              <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
              <div
                role="gridcell"
                [attr.aria-colindex]="c + 1"
                [class]="cellClass(rowIndex, c, column)"
                [style.left.px]="columnOffset(c)"
                [style.width.px]="columnWidth(c)"
                (click)="focusCell(rowIndex, c)"
              >
                @if (cellTemplate(); as tpl) {
                  <ng-container
                    [ngTemplateOutlet]="tpl.template"
                    [ngTemplateOutletContext]="{
                      $implicit: displayData()[rowIndex],
                      row: displayData()[rowIndex],
                      column: column,
                      value: cellValue(rowIndex, c),
                      rowIndex: rowIndex,
                      colIndex: c
                    }"
                  />
                } @else {
                  <span class="truncate">{{ cellValue(rowIndex, c) }}</span>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  host: {
    '[class]': 'computedClass()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiDataTable<T> {
  private readonly document = inject(ElementRef).nativeElement.ownerDocument as Document;

  readonly class = input<ClassValue>('');

  readonly data = input<readonly T[]>([]);
  readonly columns = input<readonly XuiDataColumn<T>[]>([]);

  readonly rowHeight = input<number, NumberInput>(36, { transform: numberAttribute });
  readonly headerHeight = input<number, NumberInput>(36, { transform: numberAttribute });
  readonly defaultColumnWidth = input<number, NumberInput>(150, { transform: numberAttribute });
  readonly minColumnWidth = input<number, NumberInput>(48, { transform: numberAttribute });
  /** Viewport height in pixels. */
  readonly height = input<number, NumberInput>(400, { transform: numberAttribute });
  readonly overscan = input<number, NumberInput>(4, { transform: numberAttribute });

  /** The focused cell. Two-way bindable with `[(focusedCell)]`. */
  readonly focusedCell = model<CellCoord | null>(null);

  readonly cellClicked = output<{ row: T; rowIndex: number; column: XuiDataColumn<T> }>();
  readonly sortChange = output<SortState | null>();

  private readonly scrollEl = viewChild.required<ElementRef<HTMLElement>>('scroll');
  protected readonly cellTemplate = contentChild(XuiDataCell<T>);

  private readonly scrollTop = signal(0);
  private readonly viewportHeight = computed(() => this.height() - this.headerHeight());
  protected readonly sort = signal<SortState | null>(null);

  private readonly columnStore = createGridSizeStore({
    count: computed(() => this.columns().length),
    defaultSize: this.defaultColumnWidth,
    minSize: this.minColumnWidth()
  });
  private readonly rowStore = createGridSizeStore({
    count: computed(() => this.displayData().length),
    defaultSize: this.rowHeight
  });

  constructor() {
    // Apply each column's explicit `width` to the size store when columns change.
    effect(() => {
      const columns = this.columns();
      untracked(() => {
        columns.forEach((column, index) => {
          if (column.width != null) {
            this.columnStore.setSize(index, column.width);
          }
        });
      });
    });
  }

  /** Rows sorted by the active column, or the data as-is. */
  protected readonly displayData = computed(() => {
    const data = this.data();
    const sort = this.sort();
    if (!sort) {
      return data;
    }

    const column = this.columns().find(col => col.id === sort.columnId);
    if (!column) {
      return data;
    }

    const factor = sort.direction === 'asc' ? 1 : -1;
    return [...data].sort((a, b) => factor * compareValues(this.readValue(column, a), this.readValue(column, b)));
  });

  protected readonly totalWidth = computed(() => this.columnStore.total());
  protected readonly totalHeight = computed(() => this.rowStore.total());

  /** The window of row indices to render, from the scroll position + overscan. */
  protected readonly visibleRows = computed(() => {
    const [first, last] = visibleRange(
      this.rowStore.offsets(),
      this.scrollTop(),
      this.viewportHeight(),
      this.overscan()
    );
    const rows: number[] = [];
    for (let i = first; i <= last; i++) {
      rows.push(i);
    }
    return rows;
  });

  protected readonly computedClass = computed(() =>
    xui('border-border block overflow-hidden rounded-lg border text-sm', this.class())
  );
  protected readonly scrollClass = computed(() =>
    xui(
      'focus-visible:outline-focus relative overflow-auto outline-none focus-visible:outline-2 focus-visible:-outline-offset-2'
    )
  );
  protected readonly headerRowClass = computed(() => xui('bg-surface-inset border-border sticky top-0 z-10 border-b'));
  protected readonly bodyClass = computed(() => xui('relative'));

  protected columnOffset(index: number): number {
    return this.columnStore.offsets()[index];
  }
  protected columnWidth(index: number): number {
    return this.columnStore.size(index);
  }
  protected rowOffset(index: number): number {
    return this.rowStore.offsets()[index];
  }

  protected headerCellClass(column: XuiDataColumn<T>): string {
    return xui(
      'text-foreground-muted absolute top-0 flex h-full items-center border-r border-border px-3 font-medium',
      alignClass(column.align),
      column.sortable && 'hover:text-foreground cursor-pointer select-none'
    );
  }

  protected cellClass(rowIndex: number, colIndex: number, column: XuiDataColumn<T>): string {
    const focused = this.focusedCell();
    const isFocused = focused?.row === rowIndex && focused?.col === colIndex;
    return xui(
      'border-border/60 text-foreground absolute top-0 flex h-full items-center border-r border-b px-3',
      alignClass(column.align),
      isFocused ? 'bg-primary/15 ring-primary ring-inset ring-1' : 'hover:bg-surface-inset/40'
    );
  }

  protected ariaSort(column: XuiDataColumn<T>): string | null {
    const sort = this.sort();
    if (!column.sortable) {
      return null;
    }
    if (sort?.columnId !== column.id) {
      return 'none';
    }
    return sort.direction === 'asc' ? 'ascending' : 'descending';
  }

  protected cellValue(rowIndex: number, colIndex: number): unknown {
    const row = this.displayData()[rowIndex];
    return row == null ? '' : this.readValue(this.columns()[colIndex], row);
  }

  private readValue(column: XuiDataColumn<T>, row: T): unknown {
    return column.value ? column.value(row) : (row as Record<string, unknown>)[column.id];
  }

  protected onScroll(): void {
    this.scrollTop.set(this.scrollEl().nativeElement.scrollTop);
  }

  protected focusCell(rowIndex: number, colIndex: number): void {
    this.focusedCell.set({ row: rowIndex, col: colIndex });
    this.cellClicked.emit({ row: this.displayData()[rowIndex], rowIndex, column: this.columns()[colIndex] });
  }

  protected onHeaderClick(column: XuiDataColumn<T>): void {
    if (!column.sortable) {
      return;
    }

    const current = this.sort();
    let next: SortState | null;
    if (current?.columnId !== column.id) {
      next = { columnId: column.id, direction: 'asc' };
    } else if (current.direction === 'asc') {
      next = { columnId: column.id, direction: 'desc' };
    } else {
      next = null; // third click clears the sort
    }

    this.sort.set(next);
    this.sortChange.emit(next);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const focused = this.focusedCell();
    if (!focused) {
      return;
    }

    const rowMax = this.displayData().length - 1;
    const colMax = this.columns().length - 1;
    let { row, col } = focused;

    switch (event.key) {
      case 'ArrowUp':
        row = Math.max(0, row - 1);
        break;
      case 'ArrowDown':
        row = Math.min(rowMax, row + 1);
        break;
      case 'ArrowLeft':
        col = Math.max(0, col - 1);
        break;
      case 'ArrowRight':
        col = Math.min(colMax, col + 1);
        break;
      default:
        return;
    }

    event.preventDefault();
    this.focusedCell.set({ row, col });
    this.scrollRowIntoView(row);
  }

  private scrollRowIntoView(row: number): void {
    const el = this.scrollEl().nativeElement;
    const top = this.rowOffset(row);
    const bottom = top + this.rowHeight();
    const viewTop = el.scrollTop;
    const viewBottom = viewTop + this.viewportHeight();

    if (top < viewTop) {
      el.scrollTop = top;
    } else if (bottom > viewBottom) {
      el.scrollTop = bottom - this.viewportHeight();
    }
  }

  // --- column resizing (drag the header divider) ---
  private resizeState: { index: number; startX: number; startWidth: number } | null = null;

  protected startResize(index: number, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.resizeState = { index, startX: event.clientX, startWidth: this.columnWidth(index) };
    this.document.addEventListener('mousemove', this.onResizeMove);
    this.document.addEventListener('mouseup', this.onResizeEnd);
  }

  private readonly onResizeMove = (event: MouseEvent): void => {
    if (!this.resizeState) {
      return;
    }
    const delta = event.clientX - this.resizeState.startX;
    this.columnStore.setSize(this.resizeState.index, this.resizeState.startWidth + delta);
  };

  private readonly onResizeEnd = (): void => {
    this.resizeState = null;
    this.document.removeEventListener('mousemove', this.onResizeMove);
    this.document.removeEventListener('mouseup', this.onResizeEnd);
  };

  /** Move the scroll position so a given row is at the top (used by tests/consumers). */
  scrollToRow(rowIndex: number): void {
    this.scrollEl().nativeElement.scrollTop = this.rowOffset(rowIndex);
  }

  /** The current visible row window, for assertions. */
  protected currentIndexAt(position: number): number {
    return indexAtPosition(this.rowStore.offsets(), position);
  }
}

const alignClass = (align?: 'left' | 'center' | 'right'): string =>
  align === 'center' ? 'justify-center text-center' : align === 'right' ? 'justify-end text-right' : 'justify-start';

const compareValues = (a: unknown, b: unknown): number => {
  if (a == null && b == null) {
    return 0;
  }
  if (a == null) {
    return -1;
  }
  if (b == null) {
    return 1;
  }
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  return String(a).localeCompare(String(b));
};
