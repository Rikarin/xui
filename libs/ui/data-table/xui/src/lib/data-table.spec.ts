import { render } from '@xui/testing';
import { XuiDataTableImports } from '../index';
import { XuiDataTable } from './data-table';
import type { XuiDataColumn } from './data-table.types';

interface Person {
  id: number;
  name: string;
  age: number;
}

const makeData = (n: number): Person[] =>
  Array.from({ length: n }, (_, i) => ({ id: i, name: `Person ${i}`, age: 20 + (i % 50) }));

const COLUMNS: XuiDataColumn<Person>[] = [
  { id: 'id', header: 'ID', width: 80, sortable: true },
  { id: 'name', header: 'Name', width: 200, sortable: true },
  { id: 'age', header: 'Age', width: 100, sortable: true, align: 'right' }
];

const IMPORTS = [XuiDataTableImports];

const setup = (props: Record<string, unknown> = {}) => {
  const result = render(
    `<xui-data-table [data]="props().data" [columns]="props().columns" [rowHeight]="30" [headerHeight]="30" [height]="300" [overscan]="1" />`,
    { imports: IMPORTS, props: { data: makeData(1000), columns: COLUMNS, ...props } }
  );
  const cmp = result.fixture.debugElement.query(n => n.name === 'xui-data-table')
    .componentInstance as XuiDataTable<Person>;
  return { ...result, cmp };
};

const headers = () => [...document.querySelectorAll('[role="columnheader"]')].map(h => h.textContent?.trim());
const rows = () => [...document.querySelectorAll('[role="row"][aria-rowindex]')] as HTMLElement[];
const cellText = (rowEl: HTMLElement) =>
  [...rowEl.querySelectorAll('[role="gridcell"]')].map(c => c.textContent?.trim());
const scrollEl = () => document.querySelector('xui-data-table [role="grid"]') as HTMLElement;

describe('XuiDataTable', () => {
  it('renders the column headers and exposes the grid role', () => {
    const { detect } = setup();
    detect();

    expect(headers()).toEqual(['ID', 'Name', 'Age']);
    expect(scrollEl().getAttribute('aria-colcount')).toBe('3');
    expect(scrollEl().getAttribute('aria-rowcount')).toBe('1000');
  });

  it('virtualizes: only a small window of the 1000 rows is in the DOM', () => {
    const { detect } = setup();
    detect();

    const rendered = rows().length;
    // ~10 visible (300/30) + overscan, nowhere near 1000.
    expect(rendered).toBeGreaterThan(5);
    expect(rendered).toBeLessThan(30);
  });

  it('renders the first rows at the top before scrolling', () => {
    const { detect } = setup();
    detect();

    expect(cellText(rows()[0])).toEqual(['0', 'Person 0', '20']);
  });

  it('renders a different window after scrolling down', () => {
    const { detect } = setup();
    detect();

    scrollEl().scrollTop = 3000; // row 100 at 30px each
    scrollEl().dispatchEvent(new Event('scroll'));
    detect();

    const indices = rows().map(r => Number(r.getAttribute('aria-rowindex')));
    expect(Math.min(...indices)).toBeGreaterThan(90);
    expect(Math.max(...indices)).toBeLessThan(115);
  });

  it('focuses a cell on click', () => {
    const { detect, cmp } = setup();
    detect();

    (rows()[2].querySelector('[role="gridcell"]') as HTMLElement).click();
    detect();

    expect(cmp.focusedCell()).toEqual({ row: 2, col: 0 });
  });

  it('moves the focused cell with the arrow keys', () => {
    const { detect, cmp } = setup();
    detect();
    (rows()[0].querySelectorAll('[role="gridcell"]')[0] as HTMLElement).click();
    detect();

    scrollEl().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    scrollEl().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    detect();

    expect(cmp.focusedCell()).toEqual({ row: 1, col: 1 });
  });

  describe('sorting', () => {
    it('sorts ascending, then descending, then clears on repeated header clicks', () => {
      const changes: unknown[] = [];
      const { detect } = setup({ data: makeData(5), onSort: (s: unknown) => changes.push(s) });
      detect();

      const ageHeader = [...document.querySelectorAll('[role="columnheader"]')].find(h =>
        h.textContent?.includes('Age')
      ) as HTMLElement;

      ageHeader.click(); // asc
      detect();
      expect(cellText(rows()[0])?.[2]).toBe('20');
      expect(scrollEl().querySelectorAll('[role="columnheader"]')[2].getAttribute('aria-sort')).toBe('ascending');

      ageHeader.click(); // desc
      detect();
      expect(scrollEl().querySelectorAll('[role="columnheader"]')[2].getAttribute('aria-sort')).toBe('descending');
    });

    it('does not sort a non-sortable column', () => {
      const cols: XuiDataColumn<Person>[] = [{ id: 'name', header: 'Name' }];
      const { detect } = setup({ data: makeData(3), columns: cols });
      detect();

      const header = document.querySelector('[role="columnheader"]') as HTMLElement;
      expect(header.getAttribute('aria-sort')).toBeNull();
    });
  });

  it('applies an explicit column width to the header cell', () => {
    const { detect } = setup();
    detect();

    const idHeader = document.querySelectorAll('[role="columnheader"]')[0] as HTMLElement;
    expect(idHeader.style.width).toBe('80px');
  });
});
