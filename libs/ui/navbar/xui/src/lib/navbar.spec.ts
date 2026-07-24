import { expectAttributes, expectClasses, expectNoClasses, render } from '@xui/testing';
import { XuiNavbar, XuiNavbarDivider, XuiNavbarGroup, XuiNavbarHeading } from './navbar';

const IMPORTS = [XuiNavbar, XuiNavbarGroup, XuiNavbarHeading, XuiNavbarDivider];
const setup = (template: string) => render(template, { imports: IMPORTS });

describe('XuiNavbar', () => {
  it('lays out a bordered bar', () => {
    const { query } = setup('<nav xuiNavbar></nav>');

    expectClasses(query('nav'), 'flex', 'items-center', 'border-b', 'bg-surface');
  });

  it('keeps the host element, so the landmark comes from the markup', () => {
    const { query } = setup('<nav xuiNavbar></nav>');

    // A `<div>` with a navbar class is not a landmark; assistive technology
    // navigates by the element.
    expect(query('nav').tagName).toBe('NAV');
  });

  it('sticks to the top when asked', () => {
    const { query } = setup('<nav xuiNavbar fixedToTop></nav>');

    expectClasses(query('nav'), 'sticky', 'top-0', 'shadow-elevation-1');
  });

  it('does not stick by default', () => {
    const { query } = setup('<nav xuiNavbar></nav>');

    expectNoClasses(query('nav'), 'sticky');
  });

  it('merges the class input', () => {
    const { query } = setup('<nav xuiNavbar class="px-8"></nav>');

    expectClasses(query('nav'), 'px-8', 'flex');
  });
});

describe('XuiNavbarGroup', () => {
  it.each([
    ['start', 'mr-auto'],
    ['end', 'ml-auto'],
    ['center', 'mx-auto']
  ])('pushes a %s group with %s', (align, expected) => {
    const { query } = setup(`<div xuiNavbarGroup align="${align}"></div>`);

    expectClasses(query('div'), expected, 'flex', 'items-center');
  });

  it('aligns to the start by default', () => {
    const { query } = setup('<div xuiNavbarGroup></div>');

    expectClasses(query('div'), 'mr-auto');
  });
});

describe('XuiNavbarHeading', () => {
  it('renders emphasised and unwrapped', () => {
    const { query } = setup('<span xuiNavbarHeading>xUI</span>');

    expectClasses(query('span'), 'font-semibold', 'whitespace-nowrap');
  });
});

describe('XuiNavbarDivider', () => {
  it('is decorative rather than a separator', () => {
    const { query } = setup('<div xuiNavbarDivider></div>');

    // Inside a navbar the rule is visual grouping; announcing a separator
    // between every cluster would just add noise.
    expectAttributes(query('div'), { role: 'presentation', 'aria-hidden': 'true' });
    expectClasses(query('div'), 'border-l');
  });
});
