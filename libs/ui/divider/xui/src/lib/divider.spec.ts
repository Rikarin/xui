import { expectAttributes, expectClasses, expectNoClasses, render } from '@xui/testing';
import { XuiDivider } from './divider';

const setup = (template: string) => render(template, { imports: [XuiDivider] });

describe('XuiDivider', () => {
  it('exposes itself as a horizontal separator by default', () => {
    const { query } = setup('<div xuiDivider></div>');

    expectAttributes(query('div'), { role: 'separator', 'aria-orientation': 'horizontal' });
    expectClasses(query('div'), 'block', 'border-t', 'border-border');
  });

  it('draws an inline-start border and stretches when vertical', () => {
    const { query } = setup('<div xuiDivider orientation="vertical"></div>');

    expectAttributes(query('div'), { 'aria-orientation': 'vertical' });
    expectClasses(query('div'), 'inline-block', 'border-s', 'self-stretch');
    expectNoClasses(query('div'), 'border-t');
  });

  it('keeps a margin so it does not touch adjacent content', () => {
    const { query: horizontal } = setup('<div xuiDivider></div>');
    expectClasses(horizontal('div'), 'my-2');

    const { query: vertical } = setup('<div xuiDivider orientation="vertical"></div>');
    expectClasses(vertical('div'), 'mx-2');
  });

  it('drops the margin when compact', () => {
    const { query } = setup('<div xuiDivider compact></div>');

    expectNoClasses(query('div'), 'my-2');
  });

  it('merges the class input', () => {
    const { query } = setup('<div xuiDivider class="border-dashed"></div>');

    expectClasses(query('div'), 'border-dashed', 'border-t');
  });
});
