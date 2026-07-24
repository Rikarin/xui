import { expectClasses, expectNoClasses, render } from '@xui/testing';
import { XuiControlGroup } from './control-group';

const setup = (template: string) => render(template, { imports: [XuiControlGroup] });

describe('XuiControlGroup', () => {
  it('collapses the radii and shared borders between horizontal children', () => {
    const { query } = setup('<div xuiControlGroup></div>');

    expectClasses(
      query('div'),
      'flex',
      'flex-row',
      '*:not-first:rounded-l-none',
      '*:not-last:rounded-r-none',
      '*:not-first:-ml-px'
    );
  });

  it('stacks and collapses vertically when asked', () => {
    const { query } = setup('<div xuiControlGroup vertical></div>');

    expectClasses(query('div'), 'flex-col', '*:not-first:rounded-t-none', '*:not-first:-mt-px');
    expectNoClasses(query('div'), 'flex-row');
  });

  it('stretches the children to share the width when filling', () => {
    const { query } = setup('<div xuiControlGroup fill></div>');

    expectClasses(query('div'), 'w-full', '*:flex-1');
  });

  it('merges the class input', () => {
    const { query } = setup('<div xuiControlGroup class="max-w-md"></div>');

    expectClasses(query('div'), 'max-w-md', 'flex');
  });
});
