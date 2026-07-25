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
 * smooth at 100k+ rows. Columns resize (drag the header divider) and sort (click
 * the header); the focused cell moves with the arrow keys. Built on the pure
 * `@xui/core/grid` region/size/locator model.
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
