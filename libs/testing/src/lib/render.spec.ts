import { Directive, computed, input } from '@angular/core';
import { dispatchKey, typeInto } from './events';
import { classesOf, expectAttributes, expectClasses, expectNoClasses } from './matchers';
import { render } from './render';

@Directive({
  selector: '[xuiTestMarker]',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-state]': 'state()'
  }
})
class TestMarker {
  readonly color = input<'primary' | 'error'>('primary');
  readonly state = input<string | null>(null);

  protected readonly computedClass = computed(() => `marker marker-${this.color()}`);
}

describe('render', () => {
  it('renders a template with the supplied imports', () => {
    const { query } = render('<span xuiTestMarker>hi</span>', { imports: [TestMarker] });

    expect(query('span').textContent).toBe('hi');
    expectClasses(query('span'), 'marker', 'marker-primary');
  });

  it('binds initial props', () => {
    const { query } = render<{ color: 'primary' | 'error' }>('<span xuiTestMarker [color]="props().color"></span>', {
      imports: [TestMarker],
      props: { color: 'error' }
    });

    expectClasses(query('span'), 'marker-error');
  });

  it('re-renders when setProps changes a bound input', () => {
    const { query, setProps } = render<{ color: 'primary' | 'error' }>(
      '<span xuiTestMarker [color]="props().color"></span>',
      { imports: [TestMarker], props: { color: 'primary' } }
    );

    setProps({ color: 'error' });

    expectClasses(query('span'), 'marker-error');
    expectNoClasses(query('span'), 'marker-primary');
  });

  it('throws a helpful error when a query matches nothing', () => {
    const { query } = render('<span xuiTestMarker></span>', { imports: [TestMarker] });

    expect(() => query('button')).toThrow(/no element matched "button"/);
  });

  it('queryAll returns every match', () => {
    const { queryAll } = render('<span xuiTestMarker></span><span xuiTestMarker></span>', { imports: [TestMarker] });

    expect(queryAll('span')).toHaveLength(2);
  });

  it('can render twice in one test so two configurations can be compared', () => {
    const { query: primary } = render('<span xuiTestMarker color="primary"></span>', { imports: [TestMarker] });
    const primaryClasses = primary('span').className;

    const { query: error } = render('<span xuiTestMarker color="error"></span>', { imports: [TestMarker] });

    expect(primaryClasses).toContain('marker-primary');
    expect(error('span').className).toContain('marker-error');
  });
});

describe('matchers', () => {
  it('classesOf is order independent', () => {
    const { query } = render('<span xuiTestMarker></span>', { imports: [TestMarker] });

    expect(classesOf(query('span'))).toEqual(new Set(['marker', 'marker-primary']));
  });

  it('expectClasses reports the classes that are missing', () => {
    const { query } = render('<span xuiTestMarker></span>', { imports: [TestMarker] });

    expect(() => expectClasses(query('span'), 'marker', 'nope')).toThrow(/nope/);
  });

  it('expectAttributes distinguishes absent from empty', () => {
    const { query } = render('<span xuiTestMarker></span>', { imports: [TestMarker] });

    expectAttributes(query('span'), { 'data-state': null });
    expect(() => expectAttributes(query('span'), { 'data-state': '' })).toThrow(/absent/);
  });
});

describe('events', () => {
  it('dispatchKey sends a cancelable keyboard event with modifiers', () => {
    const { query } = render('<span xuiTestMarker></span>', { imports: [TestMarker] });
    const received: KeyboardEvent[] = [];
    query('span').addEventListener('keydown', e => received.push(e as KeyboardEvent));

    dispatchKey(query('span'), 'ArrowDown', { shift: true });

    expect(received).toHaveLength(1);
    expect(received[0].key).toBe('ArrowDown');
    expect(received[0].shiftKey).toBe(true);
    expect(received[0].cancelable).toBe(true);
  });

  it('typeInto sets the value and fires input', () => {
    const { query } = render('<input />');
    const input = query<HTMLInputElement>('input');
    const received: Event[] = [];
    input.addEventListener('input', e => received.push(e));

    typeInto(input, 'hello');

    expect(input.value).toBe('hello');
    expect(received).toHaveLength(1);
  });
});
