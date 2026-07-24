import { expectClasses, render } from '@xui/testing';
import { XuiButtonGroup } from './button-group';

const setup = (template: string) => render(template, { imports: [XuiButtonGroup] });

describe('XuiButtonGroup', () => {
  it('collapses the radii and borders between its children', () => {
    const { query } = setup('<div xuiButtonGroup></div>');

    expectClasses(
      query('div'),
      'inline-flex',
      '*:not-first:rounded-l-none',
      '*:not-last:rounded-r-none',
      '*:not-first:border-l-0'
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
});
