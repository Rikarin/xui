import { expectAttributes, expectClasses, expectNoClasses, render } from '@xui/testing';
import { XuiEntityTitle } from './entity-title';

const setup = (template: string) => render(template, { imports: [XuiEntityTitle] });

describe('XuiEntityTitle', () => {
  it('renders the title', () => {
    const { host } = setup('<xui-entity-title title="Quarterly report" />');

    expect(host.textContent).toContain('Quarterly report');
  });

  it('renders the subtitle when there is one', () => {
    const { host } = setup('<xui-entity-title title="Report" subtitle="Updated 2 hours ago" />');

    expect(host.textContent).toContain('Updated 2 hours ago');
  });

  it('omits the subtitle element entirely when there is none', () => {
    const { host } = setup('<xui-entity-title title="Report" />');

    expect(host.querySelectorAll('span[xuiText]')).toHaveLength(1);
  });

  it('projects a visual and tags', () => {
    const { host } = setup(`
      <xui-entity-title title="Report">
        <span visual>icon</span>
        <span tags>badge</span>
      </xui-entity-title>
    `);

    expect(host.querySelector('[visual]')?.textContent).toBe('icon');
    expect(host.querySelector('[tags]')?.textContent).toBe('badge');
  });

  it('collapses the visual slot when nothing is projected', () => {
    const { query } = setup('<xui-entity-title title="Report" />');

    expectClasses(query('xui-entity-title > div'), 'empty:hidden');
  });

  it('truncates the text when ellipsize is set', () => {
    const { query } = setup('<xui-entity-title title="Report" ellipsize />');

    expectClasses(query('span[xuiText]'), 'text-ellipsis');
  });

  it('fills its container on request', () => {
    const { query } = setup('<xui-entity-title title="Report" fill />');

    expectClasses(query('xui-entity-title'), 'w-full');
  });

  it('masks the text in place while loading', () => {
    const { query } = setup('<xui-entity-title title="Report" subtitle="Detail" loading />');

    // Masking rather than replacing keeps the row at its final height, so
    // nothing shifts when the values arrive.
    expectClasses(query('span[xuiText]'), 'animate-pulse', 'bg-muted!');
    expectAttributes(query('span[xuiText]'), { 'aria-hidden': 'true' });
  });

  it('shows the text normally once loaded', () => {
    const { query } = setup('<xui-entity-title title="Report" />');

    expectNoClasses(query('span[xuiText]'), 'animate-pulse');
  });

  it('merges the class input', () => {
    const { query } = setup('<xui-entity-title title="Report" class="px-2" />');

    expectClasses(query('xui-entity-title'), 'px-2', 'flex');
  });
});
