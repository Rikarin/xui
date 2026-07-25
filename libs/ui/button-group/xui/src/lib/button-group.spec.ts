import { expectClasses, expectNoClasses, render } from '@xui/testing';
import { XuiButtonGroup } from './button-group';

const setup = (template: string) => render(template, { imports: [XuiButtonGroup] });

describe('XuiButtonGroup', () => {
  it('collapses the radii and borders between its children', () => {
    const { query } = setup('<div xuiButtonGroup></div>');

    expectClasses(
      query('div'),
      'inline-flex',
      '*:not-first:rounded-s-none',
      '*:not-last:rounded-e-none',
      '*:not-first:border-s-0'
    );
  });

  it('merges the class input', () => {
    const { query } = setup('<div xuiButtonGroup class="gap-0"></div>');

    expectClasses(query('div'), 'gap-0', 'inline-flex');
  });

  it('setClass adds classes without dropping the base classes', () => {
    const { fixture, query } = setup('<div xuiButtonGroup></div>');

    fixture.debugElement.children[0].injector.get(XuiButtonGroup).setClass('w-full');
    fixture.detectChanges();

    expectClasses(query('div'), 'w-full', 'inline-flex');
  });

  it('collapses on the vertical axis when stacked', () => {
    const { query } = setup('<div xuiButtonGroup vertical></div>');

    expectClasses(query('div'), 'flex-col', '*:not-first:rounded-t-none', '*:not-first:border-t-0');
    expectNoClasses(query('div'), '*:not-first:border-s-0');
  });

  it('shares the width equally when filling', () => {
    const { query } = setup('<div xuiButtonGroup fill></div>');

    expectClasses(query('div'), 'w-full', '[&>*]:flex-1', '[&>*]:min-w-0');
  });

  it('aligns the children when asked', () => {
    const { query } = setup('<div xuiButtonGroup alignText="left"></div>');

    expectClasses(query('div'), '[&>*]:justify-start');
  });
});
