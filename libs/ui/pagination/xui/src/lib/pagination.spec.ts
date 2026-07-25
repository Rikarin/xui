import { render } from '@xui/testing';
import { paginationRange, XuiPagination } from './pagination';

const setup = (attrs: string, props: Record<string, unknown> = {}) => {
  const result = render(`<xui-pagination ${attrs} [(pageIndex)]="props().page" [(pageSize)]="props().size" />`, {
    imports: [XuiPagination],
    props: { page: 1, size: 10, ...props }
  });
  const cmp = result.fixture.debugElement.query(n => n.name === 'xui-pagination').componentInstance as XuiPagination;
  return { ...result, cmp };
};

const pageButtons = () =>
  [...document.querySelectorAll('xui-pagination button')].filter(b => /^\d+$/.test(b.textContent?.trim() ?? '')) as HTMLButtonElement[];

describe('paginationRange', () => {
  it('lists all pages when they fit', () => {
    expect(paginationRange(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('collapses the right side near the start', () => {
    expect(paginationRange(1, 10)).toEqual([1, 2, 3, 4, 5, '...', 10]);
  });

  it('collapses both sides in the middle', () => {
    expect(paginationRange(5, 10)).toEqual([1, '...', 4, 5, 6, '...', 10]);
  });

  it('collapses the left side near the end', () => {
    expect(paginationRange(10, 10)).toEqual([1, '...', 6, 7, 8, 9, 10]);
  });
});

describe('XuiPagination', () => {
  it('computes the number of pages from total and pageSize', () => {
    const { detect, cmp } = setup('[total]="95"', { size: 10 });
    detect();

    // 95/10 = 10 pages; buttons show 1..5, …, 10.
    expect(cmp['totalPages']()).toBe(10);
    expect(pageButtons().map(b => b.textContent?.trim())).toEqual(['1', '2', '3', '4', '5', '10']);
  });

  it('navigates on page-button click', () => {
    const { detect, cmp } = setup('[total]="100"', { page: 1 });
    detect();

    pageButtons().find(b => b.textContent?.trim() === '3')!.click();
    detect();

    expect(cmp.pageIndex()).toBe(3);
  });

  it('disables prev on the first page and next on the last', () => {
    const { detect } = setup('[total]="30"', { page: 1, size: 10 });
    detect();

    const steps = [...document.querySelectorAll('xui-pagination button[aria-label]')] as HTMLButtonElement[];
    expect(steps[0].disabled).toBe(true); // prev
    expect(steps[1].disabled).toBe(false); // next
  });

  it('changes page size and clamps the page into range', () => {
    const { detect, cmp } = setup('[total]="100" showSizeChanger', { page: 9, size: 10 });
    detect();

    const select = document.querySelector('xui-pagination select') as HTMLSelectElement;
    select.value = '50';
    select.dispatchEvent(new Event('change'));
    detect();

    expect(cmp.pageSize()).toBe(50);
    // 100/50 = 2 pages, so page 9 clamps to 2.
    expect(cmp.pageIndex()).toBe(2);
  });

  it('shows an item summary when showTotal is set', () => {
    const { detect } = setup('[total]="248" showTotal', { page: 2, size: 10 });
    detect();

    expect((document.querySelector('xui-pagination') as HTMLElement).textContent).toContain('11-20 of 248 items');
  });
});
