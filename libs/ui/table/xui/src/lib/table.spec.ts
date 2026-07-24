import { expectAttributes, expectClasses, expectNoClasses, render } from '@xui/testing';
import { XuiCaption } from './caption';
import { XuiTable } from './table';
import { XuiTd } from './td';
import { XuiTh } from './th';
import { XuiTr } from './tr';

const IMPORTS = [XuiTable, XuiCaption, XuiTr, XuiTh, XuiTd];
const setup = (template: string) => render(template, { imports: IMPORTS });

describe('XuiTable', () => {
  it('exposes itself as a table to assistive technology', () => {
    const { query } = setup('<xui-table />');

    expectAttributes(query('xui-table'), { role: 'table' });
    expectClasses(query('xui-table'), 'flex', 'flex-col', 'text-sm');
  });

  it('is labelled by its caption', () => {
    const { query } = setup('<xui-table><xui-caption>Users</xui-caption></xui-table>');

    const captionId = query('xui-caption').id;

    expect(captionId).toBeTruthy();
    expectAttributes(query('xui-table'), { 'aria-labelledby': captionId });
  });

  it('merges the class input', () => {
    const { query } = setup('<xui-table class="w-80" />');

    expectClasses(query('xui-table'), 'w-80', 'flex-col');
  });
});

describe('XuiCaption', () => {
  it('renders last and de-emphasised by default', () => {
    const { query } = setup('<xui-caption>Users</xui-caption>');

    expectClasses(query('xui-caption'), 'block', 'text-muted-foreground', 'order-last');
    expectNoClasses(query('xui-caption'), 'sr-only');
  });

  it('stays available to screen readers when visually hidden', () => {
    const { query } = setup('<xui-caption hidden>Users</xui-caption>');

    expectClasses(query('xui-caption'), 'sr-only');
    expectNoClasses(query('xui-caption'), 'order-last');
  });
});

describe('XuiTr', () => {
  it('is a row with a themed separator and hover state', () => {
    const { query } = setup('<xui-tr />');

    expectAttributes(query('xui-tr'), { role: 'row' });
    expectClasses(query('xui-tr'), 'flex', 'border-b', 'border-border', 'hover:bg-muted');
  });

  it('highlights the selected state', () => {
    const { query } = setup('<xui-tr />');

    expectClasses(query('xui-tr'), 'data-[state=selected]:bg-muted');
  });
});

describe('XuiTh', () => {
  it('renders a de-emphasised header cell', () => {
    const { query } = setup('<xui-th>Name</xui-th>');

    expect(query('xui-th').textContent?.trim()).toBe('Name');
    expectClasses(query('xui-th'), 'flex', 'h-12', 'font-medium', 'text-foreground-muted');
  });

  it('wraps its content in a truncating span when asked', () => {
    const { host } = setup('<xui-th truncate>A very long column name</xui-th>');

    expect(host.querySelector('xui-th > span.truncate')).toBeTruthy();
  });

  it('does not wrap its content by default', () => {
    const { host } = setup('<xui-th>Name</xui-th>');

    expect(host.querySelector('xui-th > span.truncate')).toBeNull();
  });
});

describe('XuiTd', () => {
  it('renders a body cell', () => {
    const { query } = setup('<xui-td>Ada</xui-td>');

    expect(query('xui-td').textContent?.trim()).toBe('Ada');
    expectClasses(query('xui-td'), 'flex', 'p-3', 'items-center');
  });

  it('wraps its content in a truncating span when asked', () => {
    const { host } = setup('<xui-td truncate>A very long cell value</xui-td>');

    expect(host.querySelector('xui-td > span.truncate')).toBeTruthy();
  });
});
