import { expectAttributes, expectClasses, expectNoClasses, render } from '@xui/testing';
import { XuiHeading } from './heading';
import { XuiBlockquote, XuiCode, XuiCodeBlock, XuiList } from './html';
import { XuiText } from './text';

const IMPORTS = [XuiText, XuiHeading, XuiBlockquote, XuiCode, XuiCodeBlock, XuiList];
const setup = (template: string) => render(template, { imports: IMPORTS });

/** jsdom reports every element as 0×0, so overflow has to be simulated. */
function fakeOverflow(element: HTMLElement, { scrollWidth = 0, clientWidth = 0 }) {
  Object.defineProperty(element, 'scrollWidth', { value: scrollWidth, configurable: true });
  Object.defineProperty(element, 'clientWidth', { value: clientWidth, configurable: true });
}

describe('XuiText', () => {
  it('renders without any styling by default', () => {
    const { query } = setup('<p xuiText>Body copy</p>');

    expect(query('p').textContent).toBe('Body copy');
    expect(query('p').className).toBe('');
  });

  it('applies the colour variant', () => {
    const { query } = setup('<p xuiText color="muted">Body</p>');

    expectClasses(query('p'), 'text-foreground-muted');
  });

  it('applies the size and weight variants', () => {
    const { query } = setup('<p xuiText size="sm" weight="semibold">Body</p>');

    expectClasses(query('p'), 'text-sm', 'font-semibold');
  });

  it('truncates when ellipsize is set', () => {
    const { query } = setup('<span xuiText ellipsize>Long</span>');

    expectClasses(query('span'), 'overflow-hidden', 'text-ellipsis', 'whitespace-nowrap');
  });

  it('adds no title when the text is not truncated', () => {
    const { query } = setup('<span xuiText>Short</span>');

    expectAttributes(query('span'), { title: null });
  });

  it('adds no title while truncation is on but the content still fits', () => {
    // A title repeating text the user can already read is noise, and screen
    // readers announce it on top of the content.
    const { query, detect } = setup('<span xuiText ellipsize>Short</span>');
    fakeOverflow(query('span'), { scrollWidth: 50, clientWidth: 50 });
    detect();

    expectAttributes(query('span'), { title: null });
  });

  it('adds its own text as the title once the content overflows', () => {
    const { fixture, query, detect } = setup('<span xuiText ellipsize>A very long value</span>');
    fakeOverflow(query('span'), { scrollWidth: 300, clientWidth: 100 });

    fixture.debugElement.children[0].injector.get(XuiText).remeasure();
    detect();

    expect(query('span').getAttribute('title')).toBe('A very long value');
  });

  it('drops the title again once the content fits', () => {
    const { fixture, query, detect } = setup('<span xuiText ellipsize>A very long value</span>');
    const instance = fixture.debugElement.children[0].injector.get(XuiText);

    fakeOverflow(query('span'), { scrollWidth: 300, clientWidth: 100 });
    instance.remeasure();
    detect();

    fakeOverflow(query('span'), { scrollWidth: 100, clientWidth: 100 });
    instance.remeasure();
    detect();

    expectAttributes(query('span'), { title: null });
  });

  it('lets an explicit title win over the generated one', () => {
    const { fixture, query, detect } = setup('<span xuiText ellipsize title="Explicit">Long</span>');
    fakeOverflow(query('span'), { scrollWidth: 300, clientWidth: 100 });

    fixture.debugElement.children[0].injector.get(XuiText).remeasure();
    detect();

    expectAttributes(query('span'), { title: 'Explicit' });
  });

  it('merges the class input', () => {
    const { query } = setup('<p xuiText class="mt-2">Body</p>');

    expectClasses(query('p'), 'mt-2');
  });
});

describe('XuiHeading', () => {
  it.each([
    ['h1', 'text-3xl'],
    ['h2', 'text-2xl'],
    ['h3', 'text-xl'],
    ['h4', 'text-lg'],
    ['h5', 'text-base'],
    ['h6', 'text-sm']
  ])('sizes %s from its own tag', (tag, expected) => {
    const { query } = setup(`<${tag} xuiHeading>Title</${tag}>`);

    expectClasses(query(tag), expected, 'font-semibold');
  });

  it('lets level override the visual size without changing the element', () => {
    const { query } = setup('<h2 xuiHeading [level]="4">Title</h2>');

    // The outline still says h2; only the appearance changes.
    expect(query('h2').tagName).toBe('H2');
    expectClasses(query('h2'), 'text-lg');
    expectNoClasses(query('h2'), 'text-2xl');
  });

  it('merges the class input', () => {
    const { query } = setup('<h1 xuiHeading class="mb-4">Title</h1>');

    expectClasses(query('h1'), 'mb-4', 'text-3xl');
  });
});

describe('html elements', () => {
  it('styles a blockquote', () => {
    const { query } = setup('<blockquote xuiBlockquote>Quote</blockquote>');

    expectClasses(query('blockquote'), 'border-l-4', 'italic', 'text-foreground-muted');
  });

  it('styles inline code', () => {
    const { query } = setup('<code xuiCode>npm i</code>');

    expectClasses(query('code'), 'font-mono', 'bg-muted', 'rounded');
  });

  it('styles a code block and neutralises the code inside it', () => {
    const { query } = setup('<pre xuiCodeBlock><code>npm i</code></pre>');

    expectClasses(query('pre'), 'overflow-x-auto', 'bg-surface-inset', '[&_code]:bg-transparent');
  });

  it('picks the marker style from the list element itself', () => {
    const { query: ordered } = setup('<ol xuiList><li>One</li></ol>');
    expectClasses(ordered('ol'), '[&:is(ol)]:list-decimal', '[&:is(ul)]:list-disc');

    const { query: unordered } = setup('<ul xuiList><li>One</li></ul>');
    expectClasses(unordered('ul'), '[&:is(ul)]:list-disc');
  });

  it('merges the class input on an inherited directive', () => {
    const { query } = setup('<code xuiCode class="text-error">npm i</code>');

    expectClasses(query('code'), 'text-error', 'font-mono');
  });
});
