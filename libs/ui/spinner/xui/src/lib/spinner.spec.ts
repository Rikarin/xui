import { expectAttributes, expectClasses, render } from '@xui/testing';
import { XuiSpinner } from './spinner';

const setup = (template: string) => render(template, { imports: [XuiSpinner] });

describe('XuiSpinner', () => {
  it('announces itself as a status to assistive technology', () => {
    const { query } = setup('<xui-spinner>Loading users</xui-spinner>');

    expectAttributes(query('xui-spinner'), { role: 'status' });
    expect(query('.sr-only').textContent).toBe('Loading users');
  });

  it('hides the decorative svg from assistive technology', () => {
    const { query } = setup('<xui-spinner />');

    expectAttributes(query('svg'), { 'aria-hidden': 'true' });
  });

  it('defaults to the md size and primary colour', () => {
    const { query } = setup('<xui-spinner />');

    expectClasses(query('xui-spinner'), 'w-8', 'h-8', '[&>svg]:fill-primary');
  });

  it('applies the size variant', () => {
    const { query } = setup('<xui-spinner size="xs" />');

    expectClasses(query('xui-spinner'), 'h-4', 'w-4');
  });

  it('applies the colour variant', () => {
    const { query } = setup('<xui-spinner color="error" />');

    expectClasses(query('xui-spinner'), '[&>svg]:fill-error', '[&>svg]:text-error/30');
  });

  it('merges the class input', () => {
    const { query } = setup('<xui-spinner class="mx-auto" />');

    expectClasses(query('xui-spinner'), 'mx-auto', 'inline-block');
  });
});
