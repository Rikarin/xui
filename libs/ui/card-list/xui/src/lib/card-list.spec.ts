import { expectClasses, expectNoClasses, render } from '@xui/testing';
import { XuiCardList } from './card-list';

const setup = (template: string) => render(template, { imports: [XuiCardList] });

describe('XuiCardList', () => {
  it('stacks its children and separates them with hairlines', () => {
    const { query } = setup('<div xuiCardList><div>One</div><div>Two</div></div>');

    expectClasses(query('div'), 'flex', 'flex-col', '[&>*]:border-b', '[&>*:last-child]:border-b-0');
  });

  it('flattens the child cards so they read as rows', () => {
    const { query } = setup('<div xuiCardList></div>');

    expectClasses(query('div'), '[&>*]:rounded-none', '[&>*]:shadow-none');
  });

  it('draws its own frame by default', () => {
    const { query } = setup('<div xuiCardList></div>');

    expectClasses(query('div'), 'border', 'rounded-lg', 'overflow-hidden', 'shadow-elevation-1');
  });

  it('drops the frame when nested inside another bordered container', () => {
    const { query } = setup('<div xuiCardList [bordered]="false"></div>');

    expectNoClasses(query('div'), 'border', 'rounded-lg', 'shadow-elevation-1');
  });

  it('cascades the compact padding to every row', () => {
    const { query } = setup('<div xuiCardList compact></div>');

    // The child cards do not each need `compact` set — this is what makes the
    // list the single place that controls row density.
    expectClasses(query('div'), '[&>*]:p-3');
    expectNoClasses(query('div'), '[&>*]:p-4');
  });

  it('merges the class input', () => {
    const { query } = setup('<div xuiCardList class="w-96"></div>');

    expectClasses(query('div'), 'w-96', 'flex-col');
  });
});
