import { expectClasses, render } from '@xui/testing';
import { XuiResult } from './result';
import { provideXuiResultConfig } from './result.token';

const setup = (template: string, providers: unknown[] = []) => render(template, { imports: [XuiResult], providers });
const host = () => document.querySelector('xui-result') as HTMLElement;

describe('XuiResult', () => {
  it('renders title and subtitle', () => {
    setup('<xui-result status="success" title="Done" subtitle="All good." />');

    expect(host().querySelector('h2')?.textContent).toBe('Done');
    expect(host().querySelector('p')?.textContent).toBe('All good.');
  });

  it('shows a status glyph with the matching tint', () => {
    setup('<xui-result status="error" title="Failed" />');

    const glyph = host().querySelector('ng-icon') as HTMLElement;
    expect(glyph).not.toBeNull();
    expect(glyph.getAttribute('class')).toContain('text-error');
  });

  it('renders an HTTP code for 404/403/500 statuses', () => {
    setup('<xui-result status="404" title="Not found" />');

    expect(host().querySelector('ng-icon')).toBeNull();
    expect(host().textContent).toContain('404');
  });

  it('projects an action into the extra slot', () => {
    setup('<xui-result status="info" title="Heads up"><button xuiResultExtra>Retry</button></xui-result>');

    expect(host().querySelector('button[xuiResultExtra]')?.textContent).toBe('Retry');
  });

  it('takes its status default from the injected config', () => {
    setup('<xui-result title="Done" />', [provideXuiResultConfig({ status: 'success' })]);

    expect(host().querySelector('ng-icon')?.getAttribute('class')).toContain('text-success');
  });

  it('centres its layout', () => {
    setup('<xui-result title="x" />');
    expectClasses(host(), 'flex', 'flex-col', 'items-center', 'text-center');
  });
});
