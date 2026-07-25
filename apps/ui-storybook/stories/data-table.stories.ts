import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiDataTable, XuiDataTableImports, type XuiDataColumn } from '@xui/data-table';

interface Row {
  id: number;
  name: string;
  email: string;
  city: string;
  age: number;
}

const CITIES = ['Amsterdam', 'Berlin', 'Copenhagen', 'Lisbon', 'Prague', 'Vienna', 'Warsaw'];
const makeRows = (n: number): Row[] =>
  Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    name: `Person ${i + 1}`,
    email: `person${i + 1}@example.com`,
    city: CITIES[i % CITIES.length],
    age: 20 + ((i * 7) % 50)
  }));

const COLUMNS: XuiDataColumn<Row>[] = [
  { id: 'id', header: 'ID', width: 80, sortable: true, align: 'right' },
  { id: 'name', header: 'Name', width: 160, sortable: true },
  { id: 'email', header: 'Email', width: 240, sortable: true },
  { id: 'city', header: 'City', width: 140, sortable: true },
  { id: 'age', header: 'Age', width: 80, sortable: true, align: 'right' }
];

/**
 * A virtualized data grid — only the visible rows are in the DOM, so it stays
 * smooth at 100k+ rows. Columns resize (drag the header divider), auto-fit
 * (double-click the divider), reorder (drag the header) and sort (click the
 * header). Cells select as regions (click, shift-click for a range, ⌘/Ctrl-click
 * for disjoint blocks, ⌘/Ctrl+A for all), the focused cell moves with the arrow
 * keys (hold Shift to extend), and ⌘/Ctrl+C copies the selection as TSV. Built on
 * the pure `@xui/core/grid` region/size/locator model.
 */
const meta: Meta<XuiDataTable<Row>> = {
  title: 'Data display/Data table',
  component: XuiDataTable,
  decorators: [moduleMetadata({ imports: [XuiDataTableImports] })]
};

export default meta;
type Story = StoryObj<XuiDataTable<Row>>;

export const Default: Story = {
  render: () => ({
    props: { rows: makeRows(1000), columns: COLUMNS },
    template: `
      <xui-data-table class="w-[760px]" [data]="rows" [columns]="columns" [height]="360" />
      <p class="text-foreground-muted mt-2 text-sm">1,000 rows — only the visible window is rendered.</p>
    `
  })
};

/** A hundred thousand rows, still smooth thanks to row virtualization. */
export const HundredThousandRows: Story = {
  render: () => ({
    props: { rows: makeRows(100_000), columns: COLUMNS },
    template: `
      <xui-data-table class="w-[760px]" [data]="rows" [columns]="columns" [height]="400" />
      <p class="text-foreground-muted mt-2 text-sm">100,000 rows.</p>
    `
  })
};

/**
 * Region selection + copy. Click a cell, shift-click for a range, ⌘/Ctrl-click
 * for disjoint blocks; press ⌘/Ctrl+C to copy the selection as tab-separated text
 * (shown below). Drag a header to reorder; double-click a divider to auto-fit.
 */
export const SelectionAndCopy: Story = {
  render: () => ({
    props: { rows: makeRows(200), columns: COLUMNS, copied: '' },
    template: `
      <xui-data-table
        class="w-[760px]"
        [data]="rows"
        [columns]="columns"
        [height]="360"
        (copied)="copied = $event"
      />
      <p class="text-foreground-muted mt-2 text-sm">
        Select cells, then press <kbd>⌘/Ctrl</kbd>+<kbd>C</kbd>. Copied text:
      </p>
      <pre class="bg-surface-inset text-foreground mt-1 max-w-[760px] overflow-auto rounded-md p-2 text-xs">{{ copied || '—' }}</pre>
    `
  })
};

/** A custom cell template — colouring the age column. */
export const CustomCells: Story = {
  render: () => ({
    props: { rows: makeRows(500), columns: COLUMNS },
    template: `
      <xui-data-table class="w-[760px]" [data]="rows" [columns]="columns" [height]="360">
        <ng-template xuiDataCell let-value let-column="column">
          @if (column.id === 'age') {
            <span [class]="value >= 50 ? 'text-warning font-medium' : ''">{{ value }}</span>
          } @else {
            <span class="truncate">{{ value }}</span>
          }
        </ng-template>
      </xui-data-table>
    `
  })
};

const WIDE_COLUMNS: XuiDataColumn<Row & Record<string, unknown>>[] = [
  { id: 'id', header: 'ID', width: 70, align: 'right' },
  { id: 'name', header: 'Name', width: 150 },
  ...Array.from({ length: 30 }, (_, i) => ({
    id: `q${i + 1}`,
    header: `Q${i + 1} metric`,
    width: 130,
    value: (row: Row) => ((row.id * (i + 3)) % 1000) / 10
  }))
];

/**
 * A wide grid — 32 columns, only the visible window is in the DOM (horizontal
 * virtualization). The first two columns are frozen (`numFrozenColumns`) and the
 * first row is frozen (`numFrozenRows`), forming a pinned quadrant: ID/Name stay
 * put as you scroll right, and row 1 stays put as you scroll down.
 * Resize/reorder/sort/select all still work.
 */
export const FrozenColumns: Story = {
  render: () => ({
    props: { rows: makeRows(2000), columns: WIDE_COLUMNS },
    template: `
      <xui-data-table
        class="w-[720px]"
        [data]="rows"
        [columns]="columns"
        [height]="360"
        [numFrozenColumns]="2"
        [numFrozenRows]="1"
      />
      <p class="text-foreground-muted mt-2 text-sm">32 columns · 2 frozen cols · 1 frozen row · scroll any direction</p>
    `
  })
};

/** A leading row-header gutter — click a number to select the whole row (shift for a range). */
export const RowHeaders: Story = {
  render: () => ({
    props: { rows: makeRows(500), columns: COLUMNS },
    template: `
      <xui-data-table class="w-[760px]" [data]="rows" [columns]="columns" [height]="360" [showRowHeader]="true" />
    `
  })
};

interface Note {
  id: number;
  title: string;
  body: string;
  meta: Record<string, unknown>;
}
const NOTES: Note[] = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  title: `Note ${i + 1}`,
  body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  meta: { pinned: i % 3 === 0, tags: ['alpha', 'beta'], score: (i * 13) % 100 }
}));
const NOTE_COLUMNS: XuiDataColumn<Note>[] = [
  { id: 'id', header: '#', width: 56, align: 'right' },
  { id: 'title', header: 'Title', width: 140 },
  { id: 'body', header: 'Body (truncated)', width: 260 },
  { id: 'meta', header: 'Meta (JSON)', width: 260 }
];

/**
 * Cell renderers: {@link XuiTruncatedFormat} clips the long body with a "more"
 * toggle, and {@link XuiJsonFormat} pretty-prints the metadata object.
 */
export const CellFormatters: Story = {
  render: () => ({
    props: { rows: NOTES, columns: NOTE_COLUMNS },
    template: `
      <xui-data-table class="w-[760px]" [data]="rows" [columns]="columns" [height]="360" [rowHeight]="72">
        <ng-template xuiDataCell let-value let-column="column">
          @switch (column.id) {
            @case ('body') { <xui-truncated-format [value]="value" [length]="70" /> }
            @case ('meta') { <xui-json-format [value]="value" [pretty]="true" [length]="120" /> }
            @default { <span class="truncate">{{ value }}</span> }
          }
        </ng-template>
      </xui-data-table>
    `
  })
};

interface Task {
  id: number;
  task: string;
  owner: string;
}
const TASK_COLUMNS: XuiDataColumn<Task>[] = [
  { id: 'id', header: 'ID', width: 60, align: 'right' },
  { id: 'task', header: 'Task', width: 320 },
  { id: 'owner', header: 'Owner', width: 200 }
];

/**
 * Editable cells via {@link XuiEditableCell} — double-click (or focus + Enter) a
 * Task or Owner cell to edit; Enter commits, Escape cancels. Edits write back to
 * the row objects.
 */
export const EditableCells: Story = {
  render: () => ({
    props: {
      rows: Array.from({ length: 30 }, (_, i) => ({ id: i + 1, task: `Task ${i + 1}`, owner: 'unassigned' })),
      columns: TASK_COLUMNS,
      save: (row: Task, column: XuiDataColumn<Task>, value: string) => {
        (row as unknown as Record<string, unknown>)[column.id] = value;
      }
    },
    template: `
      <xui-data-table class="w-[600px]" [data]="rows" [columns]="columns" [height]="360" [selectable]="false">
        <ng-template xuiDataCell let-value let-row="row" let-column="column">
          @if (column.id === 'id') {
            <span class="tabular-nums">{{ value }}</span>
          } @else {
            <xui-editable-cell [value]="value" (edited)="save(row, column, $event)" />
          }
        </ng-template>
      </xui-data-table>
    `
  })
};
