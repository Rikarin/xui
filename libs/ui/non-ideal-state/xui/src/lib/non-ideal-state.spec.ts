import { expectClasses, expectNoClasses, render } from '@xui/testing';
import { XuiNonIdealState } from './non-ideal-state';

const setup = (template: string) => render(template, { imports: [XuiNonIdealState] });

describe('XuiNonIdealState', () => {
  it('centres its content vertically by default', () => {
    const { query } = setup('<xui-non-ideal-state title="No results" />');

    expectClasses(query('xui-non-ideal-state'), 'flex', 'flex-col', 'items-center', 'text-center');
  });

  it('renders the title and description', () => {
    const { host } = setup('<xui-non-ideal-state title="No results" description="Try again." />');

    expect(host.textContent).toContain('No results');
    expect(host.textContent).toContain('Try again.');
  });

  it('omits the text elements it has no content for', () => {
    const { host } = setup('<xui-non-ideal-state />');

    expect(host.querySelectorAll('p')).toHaveLength(0);
  });

  it('projects a visual', () => {
    const { host } = setup('<xui-non-ideal-state title="Empty"><span visual>icon</span></xui-non-ideal-state>');

    expect(host.querySelector('[visual]')?.textContent).toBe('icon');
  });

  it('projects an action', () => {
    const { host } = setup('<xui-non-ideal-state title="Empty"><button action>Retry</button></xui-non-ideal-state>');

    expect(host.querySelector('[action]')?.textContent).toBe('Retry');
  });

  it('collapses the visual and action slots when nothing is projected', () => {
    const { query } = setup('<xui-non-ideal-state title="Empty" />');

    // `empty:hidden` keeps the gaps from an unused slot out of the layout.
    expectClasses(query('xui-non-ideal-state > div'), 'empty:hidden');
  });

  it('lays out horizontally when asked', () => {
    const { query } = setup('<xui-non-ideal-state layout="horizontal" title="No results" />');

    expectClasses(query('xui-non-ideal-state'), 'flex-row', 'text-start');
    expectNoClasses(query('xui-non-ideal-state'), 'flex-col');
  });

  it('merges the class input', () => {
    const { query } = setup('<xui-non-ideal-state class="min-h-64" />');

    expectClasses(query('xui-non-ideal-state'), 'min-h-64', 'flex');
  });
});
