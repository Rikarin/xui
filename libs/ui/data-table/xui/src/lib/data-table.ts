import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  effect,
  ElementRef,
  inject,
  input,
  linkedSignal,
  model,
  numberAttribute,
  output,
  signal,
  untracked,
  viewChild,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import {
  anyRegionContainsCell,
  cellRegion,
  createGridSizeStore,
  indexAtPosition,
  regionBounds,
  tableRegion,
  toggleRegion,
  visibleRange,
  type Region
} from '@xui/core/grid';
import type { ClassValue } from 'clsx';
import { XuiDataCell } from './data-cell';
import type { CellCoord, SortState, XuiDataColumn } from './data-table.types';

/**
 * A virtualized data grid: only the visible rows are in the DOM, so it stays
 * smooth at 100k+ rows. Columns are resizable (drag the header divider),
 * reorderable (drag the header), auto-fit (double-click the divider) and
 * sortable; cells support region selection (shift/ctrl-click, arrow keys) and
 * copy-to-clipboard. Cells render with an optional `[xuiDataCell]` template.
 * Built on the pure `@xui/core/grid` region/size/locator model.
 */
@Component({
  selector: 'xui-data-table',
  imports: [NgTemplateOutlet],
  template: `
    <div
      #scroll
      role="grid"
      [attr.aria-rowcount]="displayData().length"
      [attr.aria-colcount]="orderedColumns().length"
      [attr.aria-multiselectable]="selectable() ? true : null"
      [class]="scrollClass()"
      [style.height.px]="height()"
      (scroll)="onScroll()"
      (keydown)="onKeydown($event)"
      tabindex="0"
    >
      <!-- Header row: sticks to the top, scrolls horizontally with the body. -->
      <div role="row" [class]="headerRowClass()" [style.height.px]="headerHeight()" [style.width.px]="totalWidth()">
        @for (column of orderedColumns(); track column.id; let c = $index) {
          <!-- Header sort/reorder is a pointer convenience; the grid container owns keyboard interaction. -->
          <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
          <div
            role="columnheader"
            [attr.data-col]="c"
            [class]="headerCellClass(column, c)"
            [style.left.px]="columnOffset(c)"
            [style.width.px]="columnWidth(c)"
            [attr.aria-sort]="ariaSort(column)"
            (mousedown)="startReorder(c, $event)"
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
              (dblclick)="autoFitColumn(c, $event)"
              (click)="$event.stopPropagation()"
            ></span>
          </div>
        }
        @if (reorderIndicatorLeft() !== null) {
          <div
            class="bg-primary pointer-events-none absolute top-0 bottom-0 z-20 w-0.5"
            [style.left.px]="reorderIndicatorLeft()"
          ></div>
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
            @for (column of orderedColumns(); track column.id; let c = $index) {
              <!-- Cell focus/selection is a pointer convenience; arrow-key navigation runs on the grid container. -->
              <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
              <div
                role="gridcell"
                [attr.data-col]="c"
                [attr.aria-colindex]="c + 1"
                [attr.aria-selected]="selectable() ? isSelected(rowIndex, c) : null"
                [class]="cellClass(rowIndex, c, column)"
                [style.left.px]="columnOffset(c)"
                [style.width.px]="columnWidth(c)"
                (click)="onCellClick(rowIndex, c, $event)"
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

  /** Allow selecting cell regions (shift-range, ctrl/cmd-toggle, arrow keys). */
  readonly selectable = input<boolean, BooleanInput>(true, { transform: booleanAttribute });
  /** Allow more than one disjoint region (ctrl/cmd-click, select-all). */
  readonly enableMultipleSelection = input<boolean, BooleanInput>(true, { transform: booleanAttribute });
  /** Allow reordering columns by dragging their headers. */
  readonly reorderable = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

  /** The focused cell. Two-way bindable with `[(focusedCell)]`. */
  readonly focusedCell = model<CellCoord | null>(null);
  /** The selected regions. Two-way bindable with `[(selection)]`. */
  readonly selection = model<Region[]>([]);

  readonly cellClicked = output<{ row: T; rowIndex: number; column: XuiDataColumn<T> }>();
  readonly sortChange = output<SortState | null>();
  /** Emitted with the tab-separated text when the selection is copied. */
  readonly copied = output<string>();
  /** Emitted when a column is dragged to a new position (indices into the displayed order). */
  readonly columnReorder = output<{ from: number; to: number }>();

  private readonly scrollEl = viewChild.required<ElementRef<HTMLElement>>('scroll');
  protected readonly cellTemplate = contentChild(XuiDataCell<T>);

  private readonly scrollTop = signal(0);
  private readonly viewportHeight = computed(() => this.height() - this.headerHeight());
  protected readonly sort = signal<SortState | null>(null);

  /** The anchor cell for shift-extended range selection. */
  private readonly selectionAnchor = signal<CellCoord | null>(null);

  /** Source indices (into `columns()`) in display order; resets when columns change. */
  private readonly columnOrder = linkedSignal<number[]>(() => this.columns().map((_, i) => i));
  /** Columns in their displayed order. */
  protected readonly orderedColumns = computed(() => this.columnOrder().map(i => this.columns()[i]));

  private readonly columnStore = createGridSizeStore({
    count: computed(() => this.orderedColumns().length),
    defaultSize: this.defaultColumnWidth,
    minSize: this.minColumnWidth()
  });
  private readonly rowStore = createGridSizeStore({
    count: computed(() => this.displayData().length),
    defaultSize: this.rowHeight
  });

  constructor() {
    // Apply each column's explicit `width` to the size store when columns change.
    // `columnOrder` resets to identity here, so display position == source index.
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

  // --- column reorder drag state ---
  private readonly reorderSource = signal<number | null>(null);
  private readonly reorderTarget = signal<number | null>(null);

  /** Pixel x of the drop indicator during a reorder drag, or `null` when idle. */
  protected readonly reorderIndicatorLeft = computed(() => {
    const source = this.reorderSource();
    const target = this.reorderTarget();
    if (source === null || target === null) {
      return null;
    }
    // Draw at the near edge of the drop slot: the far side when moving right.
    return target > source ? this.columnOffset(target) + this.columnWidth(target) : this.columnOffset(target);
  });

  protected columnOffset(index: number): number {
    return this.columnStore.offsets()[index];
  }
  protected columnWidth(index: number): number {
    return this.columnStore.size(index);
  }
  protected rowOffset(index: number): number {
    return this.rowStore.offsets()[index];
  }

  protected headerCellClass(column: XuiDataColumn<T>, colIndex: number): string {
    return xui(
      'text-foreground-muted absolute top-0 flex h-full items-center border-r border-border px-3 font-medium',
      alignClass(column.align),
      column.sortable && 'hover:text-foreground cursor-pointer select-none',
      this.reorderable() && 'cursor-grab',
      this.reorderSource() === colIndex && 'opacity-40'
    );
  }

  protected cellClass(rowIndex: number, colIndex: number, column: XuiDataColumn<T>): string {
    const focused = this.focusedCell();
    const isFocused = focused?.row === rowIndex && focused?.col === colIndex;
    const isSelected = this.isSelected(rowIndex, colIndex);
    return xui(
      'border-border/60 text-foreground absolute top-0 flex h-full items-center border-r border-b px-3',
      alignClass(column.align),
      isFocused
        ? 'bg-primary/15 ring-primary ring-inset ring-1'
        : isSelected
          ? 'bg-primary/10'
          : 'hover:bg-surface-inset/40'
    );
  }

  protected isSelected(rowIndex: number, colIndex: number): boolean {
    return anyRegionContainsCell(this.selection(), rowIndex, colIndex);
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
    return row == null ? '' : this.readValue(this.orderedColumns()[colIndex], row);
  }

  private readValue(column: XuiDataColumn<T>, row: T): unknown {
    return column.value ? column.value(row) : (row as Record<string, unknown>)[column.id];
  }

  protected onScroll(): void {
    this.scrollTop.set(this.scrollEl().nativeElement.scrollTop);
  }

  // --- selection ---
  protected onCellClick(rowIndex: number, colIndex: number, event: MouseEvent): void {
    if (this.selectable()) {
      const multi = (event.metaKey || event.ctrlKey) && this.enableMultipleSelection();
      if (event.shiftKey && this.selectionAnchor()) {
        const anchor = this.selectionAnchor()!;
        const region = cellRegion(anchor.row, anchor.col, rowIndex, colIndex);
        // Shift extends the active region; with ctrl/cmd it keeps the earlier ones.
        const base = multi ? this.selection().slice(0, -1) : [];
        this.selection.set([...base, region]);
      } else if (multi) {
        this.selection.set(toggleRegion(this.selection(), cellRegion(rowIndex, colIndex)));
        this.selectionAnchor.set({ row: rowIndex, col: colIndex });
      } else {
        this.selection.set([cellRegion(rowIndex, colIndex)]);
        this.selectionAnchor.set({ row: rowIndex, col: colIndex });
      }
    }
    this.focusCell(rowIndex, colIndex);
  }

  protected focusCell(rowIndex: number, colIndex: number): void {
    this.focusedCell.set({ row: rowIndex, col: colIndex });
    this.cellClicked.emit({ row: this.displayData()[rowIndex], rowIndex, column: this.orderedColumns()[colIndex] });
  }

  protected onHeaderClick(column: XuiDataColumn<T>): void {
    // A drag that reordered the column suppresses the trailing click.
    if (this.suppressHeaderClick) {
      this.suppressHeaderClick = false;
      return;
    }
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
    const mod = event.metaKey || event.ctrlKey;

    if (mod && (event.key === 'c' || event.key === 'C')) {
      this.copySelection();
      event.preventDefault();
      return;
    }
    if (this.selectable() && mod && (event.key === 'a' || event.key === 'A')) {
      this.selection.set([tableRegion()]);
      this.selectionAnchor.set({ row: 0, col: 0 });
      event.preventDefault();
      return;
    }
    if (event.key === 'Escape') {
      if (this.selection().length) {
        this.selection.set([]);
        event.preventDefault();
      }
      return;
    }

    const focused = this.focusedCell();
    if (!focused) {
      return;
    }

    const rowMax = this.displayData().length - 1;
    const colMax = this.orderedColumns().length - 1;
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
    if (this.selectable()) {
      if (event.shiftKey && this.selectionAnchor()) {
        const anchor = this.selectionAnchor()!;
        this.selection.set([cellRegion(anchor.row, anchor.col, row, col)]);
      } else {
        this.selection.set([cellRegion(row, col)]);
        this.selectionAnchor.set({ row, col });
      }
    }
    this.scrollRowIntoView(row);
  }

  // --- copy-to-clipboard ---
  private copySelection(): void {
    const text = this.buildClipboardText();
    if (!text) {
      return;
    }
    this.document.defaultView?.navigator?.clipboard?.writeText?.(text).catch(() => undefined);
    this.copied.emit(text);
  }

  /** The selected region(s) as tab-separated rows (unselected cells within the bounding box are blank). */
  buildClipboardText(): string {
    const regions = this.selection();
    if (!regions.length) {
      return '';
    }
    const rowCount = this.displayData().length;
    const colCount = this.orderedColumns().length;
    if (!rowCount || !colCount) {
      return '';
    }

    let r0 = Infinity;
    let r1 = -Infinity;
    let c0 = Infinity;
    let c1 = -Infinity;
    for (const region of regions) {
      const [ar0, ar1, ac0, ac1] = regionBounds(region, rowCount, colCount);
      r0 = Math.min(r0, ar0);
      r1 = Math.max(r1, ar1);
      c0 = Math.min(c0, ac0);
      c1 = Math.max(c1, ac1);
    }

    const lines: string[] = [];
    for (let r = r0; r <= r1; r++) {
      const cells: string[] = [];
      for (let c = c0; c <= c1; c++) {
        cells.push(anyRegionContainsCell(regions, r, c) ? String(this.cellValue(r, c) ?? '') : '');
      }
      lines.push(cells.join('\t'));
    }
    return lines.join('\n');
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

  /** Fit a column to the widest of its header + currently-rendered cells (double-click the divider). */
  protected autoFitColumn(index: number, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const grid = this.scrollEl().nativeElement;
    const cells = grid.querySelectorAll<HTMLElement>(`[data-col="${index}"]`);
    let widest = this.minColumnWidth();
    cells.forEach(cell => {
      widest = Math.max(widest, cell.scrollWidth + 8);
    });
    this.columnStore.setSize(index, widest);
  }

  // --- column reorder (drag the header) ---
  private reorderState: { index: number; startX: number } | null = null;
  private suppressHeaderClick = false;

  protected startReorder(index: number, event: MouseEvent): void {
    if (!this.reorderable() || event.button !== 0) {
      return;
    }
    this.reorderState = { index, startX: event.clientX };
    this.document.addEventListener('mousemove', this.onReorderMove);
    this.document.addEventListener('mouseup', this.onReorderEnd);
  }

  private readonly onReorderMove = (event: MouseEvent): void => {
    const state = this.reorderState;
    if (!state) {
      return;
    }
    // Wait for a small threshold so a plain click still sorts.
    if (this.reorderSource() === null) {
      if (Math.abs(event.clientX - state.startX) < 4) {
        return;
      }
      this.reorderSource.set(state.index);
    }
    event.preventDefault();

    const grid = this.scrollEl().nativeElement;
    const x = event.clientX - grid.getBoundingClientRect().left + grid.scrollLeft;
    const last = this.orderedColumns().length - 1;
    this.reorderTarget.set(Math.max(0, Math.min(last, indexAtPosition(this.columnStore.offsets(), x))));
  };

  private readonly onReorderEnd = (): void => {
    const source = this.reorderSource();
    const target = this.reorderTarget();
    if (source !== null && target !== null && source !== target) {
      this.reorderColumn(source, target);
      this.suppressHeaderClick = true;
    }
    this.reorderState = null;
    this.reorderSource.set(null);
    this.reorderTarget.set(null);
    this.document.removeEventListener('mousemove', this.onReorderMove);
    this.document.removeEventListener('mouseup', this.onReorderEnd);
  };

  /** Move a column from one displayed position to another, carrying its width. */
  reorderColumn(from: number, to: number): void {
    const last = this.orderedColumns().length - 1;
    if (from === to || from < 0 || to < 0 || from > last || to > last) {
      return;
    }
    const order = [...this.columnOrder()];
    const sizes = order.map((_, position) => this.columnStore.size(position));
    arrayMove(order, from, to);
    arrayMove(sizes, from, to);
    this.columnOrder.set(order);
    // Rewrite overrides so each displayed position keeps its column's width.
    sizes.forEach((size, position) => this.columnStore.setSize(position, size));
    this.columnReorder.emit({ from, to });
  }

  /** Move the scroll position so a given row is at the top (used by tests/consumers). */
  scrollToRow(rowIndex: number): void {
    this.scrollEl().nativeElement.scrollTop = this.rowOffset(rowIndex);
  }

  /** The current visible row window, for assertions. */
  protected currentIndexAt(position: number): number {
    return indexAtPosition(this.rowStore.offsets(), position);
  }
}

const arrayMove = <V>(list: V[], from: number, to: number): void => {
  const [item] = list.splice(from, 1);
  list.splice(to, 0, item);
};

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
