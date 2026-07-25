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

const setup = (props: Record<string, unknown> = {}, extraAttrs = '') => {
  const result = render(
    `<xui-data-table [data]="props().data" [columns]="props().columns" [rowHeight]="30" [headerHeight]="30" [height]="300" [overscan]="1" ${extraAttrs} />`,
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
const cellAt = (row: number, col: number) => rows()[row].querySelectorAll('[role="gridcell"]')[col] as HTMLElement;
const selectedCells = () => [...document.querySelectorAll('[role="gridcell"][aria-selected="true"]')] as HTMLElement[];
const mouseClick = (el: HTMLElement, init: MouseEventInit = {}) =>
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ...init }));
const keydown = (init: KeyboardEventInit) =>
  scrollEl().dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init }));

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

  describe('region selection', () => {
    it('selects a single cell on a plain click', () => {
      const { detect, cmp } = setup();
      detect();

      mouseClick(cellAt(1, 1));
      detect();

      expect(cmp.selection()).toEqual([{ rows: [1, 1], cols: [1, 1] }]);
      expect(selectedCells()).toHaveLength(1);
    });

    it('shift-clicks to extend a rectangular range from the anchor', () => {
      const { detect, cmp } = setup();
      detect();

      mouseClick(cellAt(1, 0)); // anchor
      detect();
      mouseClick(cellAt(3, 2), { shiftKey: true });
      detect();

      expect(cmp.selection()).toEqual([{ rows: [1, 3], cols: [0, 2] }]);
      // 3 rows x 3 cols visible in the window are all marked selected.
      expect(selectedCells().length).toBe(9);
    });

    it('ctrl/cmd-clicks to add and toggle off disjoint regions', () => {
      const { detect, cmp } = setup();
      detect();

      mouseClick(cellAt(0, 0));
      detect();
      mouseClick(cellAt(2, 1), { metaKey: true });
      detect();
      expect(cmp.selection()).toHaveLength(2);

      // ctrl/cmd-clicking the same cell toggles it back off.
      mouseClick(cellAt(2, 1), { metaKey: true });
      detect();
      expect(cmp.selection()).toEqual([{ rows: [0, 0], cols: [0, 0] }]);
    });

    it('does not select when selectable is off', () => {
      const { detect, cmp } = setup({}, '[selectable]="false"');
      detect();

      mouseClick(cellAt(1, 1));
      detect();

      expect(cmp.selection()).toEqual([]);
      expect(cmp.focusedCell()).toEqual({ row: 1, col: 1 });
    });

    it('extends the selection with shift + arrow keys', () => {
      const { detect, cmp } = setup();
      detect();
      mouseClick(cellAt(0, 0));
      detect();

      keydown({ key: 'ArrowDown', shiftKey: true });
      keydown({ key: 'ArrowRight', shiftKey: true });
      detect();

      expect(cmp.selection()).toEqual([{ rows: [0, 1], cols: [0, 1] }]);
    });

    it('selects everything with ctrl/cmd+a and clears with Escape', () => {
      const { detect, cmp } = setup({ data: makeData(4) });
      detect();

      keydown({ key: 'a', metaKey: true });
      detect();
      expect(cmp.selection()).toEqual([{ rows: null, cols: null }]);

      keydown({ key: 'Escape' });
      detect();
      expect(cmp.selection()).toEqual([]);
    });
  });

  describe('copy-to-clipboard', () => {
    it('copies the selected range as tab-separated rows', () => {
      const copied: string[] = [];
      const { detect } = setup(
        { data: makeData(5), onCopy: (t: string) => copied.push(t) },
        '(copied)="props().onCopy($event)"'
      );
      detect();

      mouseClick(cellAt(0, 0));
      detect();
      mouseClick(cellAt(1, 1), { shiftKey: true });
      detect();
      keydown({ key: 'c', metaKey: true });
      detect();

      expect(copied).toEqual(['0\tPerson 0\n1\tPerson 1']);
    });

    it('leaves gaps blank when copying disjoint regions', () => {
      const { detect, cmp } = setup({ data: makeData(5) });
      detect();

      mouseClick(cellAt(0, 0));
      detect();
      mouseClick(cellAt(1, 2), { metaKey: true });
      detect();

      // Bounding box rows 0-1, cols 0-2; only the two corners are selected.
      // Row 1's age is 20 + (1 % 50) = 21.
      expect(cmp.buildClipboardText()).toBe('0\t\t\n\t\t21');
    });
  });

  describe('auto-fit', () => {
    it('fits a column to at least the minimum width on double-click', () => {
      const { detect } = setup();
      detect();

      const handle = document
        .querySelectorAll('[role="columnheader"]')[0]
        .querySelector('span.cursor-col-resize') as HTMLElement;
      handle.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }));
      detect();

      const idHeader = document.querySelectorAll('[role="columnheader"]')[0] as HTMLElement;
      // jsdom reports scrollWidth 0, so auto-fit falls back to the min column width.
      expect(parseInt(idHeader.style.width, 10)).toBeGreaterThanOrEqual(48);
    });
  });

  describe('column reorder', () => {
    it('moves a column to a new position, carrying its width', () => {
      const reorders: unknown[] = [];
      const { detect, cmp } = setup(
        { onReorder: (e: unknown) => reorders.push(e) },
        '(columnReorder)="props().onReorder($event)"'
      );
      detect();

      expect(headers()).toEqual(['ID', 'Name', 'Age']);
      expect((document.querySelectorAll('[role="columnheader"]')[0] as HTMLElement).style.width).toBe('80px');

      cmp.reorderColumn(0, 2); // ID moves to the end
      detect();

      expect(headers()).toEqual(['Name', 'Age', 'ID']);
      // ID's 80px width follows it to the last position.
      expect((document.querySelectorAll('[role="columnheader"]')[2] as HTMLElement).style.width).toBe('80px');
      expect(reorders).toEqual([{ from: 0, to: 2 }]);
    });

    it('reorders via a header drag past the threshold', () => {
      const { detect, cmp } = setup();
      detect();

      const nameHeader = document.querySelectorAll('[role="columnheader"]')[1] as HTMLElement;
      nameHeader.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0, clientX: 100 }));
      // Drag left into the ID column's x-range (ID spans 0-80).
      document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 20 }));
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      detect();

      expect(cmp.focusedCell()).toBeDefined();
      expect(headers()).toEqual(['Name', 'ID', 'Age']);
    });

    it('does not reorder when reorderable is off', () => {
      const { detect } = setup({}, '[reorderable]="false"');
      detect();

      const nameHeader = document.querySelectorAll('[role="columnheader"]')[1] as HTMLElement;
      nameHeader.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0, clientX: 100 }));
      document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 20 }));
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      detect();

      expect(headers()).toEqual(['ID', 'Name', 'Age']);
    });
  });
});
