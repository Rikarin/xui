import { expectAttributes, expectClasses, render } from '@xui/testing';
import { XuiTocImports } from '../index';
import { provideXuiTocConfig } from './toc.token';
import type { XuiTocEntry } from './toc.types';

const ENTRIES: XuiTocEntry[] = [
  { id: 'what-it-is', label: 'What it is', level: 2 },
  { id: 'using-it', label: 'Using it', level: 2 },
  { id: 'a-detail', label: 'A detail', level: 3 },
  { id: 'internals', label: 'Internals', level: 4 }
];

const TEMPLATE = `
  <xui-toc
    [entries]="props().entries"
    [(activeId)]="props().active"
    [minLevel]="props().min ?? 2"
    [maxLevel]="props().max ?? 3"
    [scrollSpy]="props().spy ?? false"
  />
`;

interface Props {
  entries: XuiTocEntry[];
  active?: string | null;
  min?: number;
  max?: number;
  spy?: boolean;
}

/** jsdom has no IntersectionObserver; this one records what it was asked to watch. */
class FakeIntersectionObserver {
  static last: FakeIntersectionObserver | undefined;

  readonly observed: Element[] = [];
  disconnected = false;

  constructor(
    private readonly callback: IntersectionObserverCallback,
    readonly options: IntersectionObserverInit
  ) {
    FakeIntersectionObserver.last = this;
  }

  observe(element: Element): void {
    this.observed.push(element);
  }

  disconnect(): void {
    this.disconnected = true;
  }

  /** Report the given ids as inside the band, everything else as outside. */
  emit(...intersectingIds: string[]): void {
    const records = this.observed.map(target => ({
      target,
      isIntersecting: intersectingIds.includes(target.id)
    }));

    this.callback(records as unknown as IntersectionObserverEntry[], this as unknown as IntersectionObserver);
  }
}

describe('XuiToc', () => {
  it('lists a link per entry, in document order', () => {
    const { queryAll } = render<Props>(TEMPLATE, { imports: [XuiTocImports], props: { entries: ENTRIES } });

    expect(queryAll('a').map(a => a.textContent)).toEqual(['What it is', 'Using it', 'A detail']);
    // Hung off the page's own path, not a bare `#id` — see `basePath`.
    const path = `${location.pathname}${location.search}`;
    expect(queryAll('a').map(a => a.getAttribute('href'))).toEqual([
      `${path}#what-it-is`,
      `${path}#using-it`,
      `${path}#a-detail`
    ]);
  });

  it('drops the levels outside minLevel…maxLevel', () => {
    const { queryAll } = render<Props>(TEMPLATE, {
      imports: [XuiTocImports],
      props: { entries: ENTRIES, min: 2, max: 2 }
    });

    expect(queryAll('a').map(a => a.textContent)).toEqual(['What it is', 'Using it']);
  });

  it('indents by depth below minLevel', () => {
    const { queryAll } = render<Props>(TEMPLATE, { imports: [XuiTocImports], props: { entries: ENTRIES } });
    const items = queryAll('li');

    expect(items[0].style.paddingInlineStart).toBe('0rem');
    expect(items[2].style.paddingInlineStart).toBe('0.75rem');
  });

  it('marks the active entry for both sighted and assistive readers', () => {
    const { queryAll } = render<Props>(TEMPLATE, {
      imports: [XuiTocImports],
      props: { entries: ENTRIES, active: 'using-it' }
    });

    expectAttributes(queryAll('a')[1], { 'aria-current': 'location' });
    expectClasses(queryAll('a')[1], 'text-primary');
    expect(queryAll('a')[0].hasAttribute('aria-current')).toBe(false);
  });

  it('names the nav landmark after its own heading', () => {
    const { query } = render<Props>('<xui-toc [entries]="props().entries" [scrollSpy]="false" />', {
      imports: [XuiTocImports],
      props: { entries: ENTRIES }
    });

    expectAttributes(query('nav'), { 'aria-label': 'On this page' });
    expect(query('nav p').textContent).toBe('On this page');
  });

  it('keeps the landmark named when the visible heading is hidden', () => {
    const { query, host } = render<Props>(
      '<xui-toc [entries]="props().entries" [label]="null" [scrollSpy]="false" />',
      { imports: [XuiTocImports], props: { entries: ENTRIES } }
    );

    expectAttributes(query('nav'), { 'aria-label': 'Table of contents' });
    expect(host.querySelector('nav p')).toBeNull();
  });

  it('merges the class input instead of replacing the variant classes', () => {
    const { query } = render<Props>('<xui-toc class="sticky top-20" [scrollSpy]="false" />', {
      imports: [XuiTocImports],
      props: { entries: [] }
    });

    expectClasses(query('xui-toc'), 'sticky', 'top-20', 'block');
  });

  it('takes its defaults from the injected config', () => {
    const { query } = render<Props>('<xui-toc [scrollSpy]="false" />', {
      imports: [XuiTocImports],
      props: { entries: [] },
      providers: [provideXuiTocConfig({ size: 'lg' })]
    });

    expectClasses(query('xui-toc'), 'text-base');
  });

  describe('scroll-spy', () => {
    const original = globalThis.IntersectionObserver;

    beforeEach(() => {
      FakeIntersectionObserver.last = undefined;
      globalThis.IntersectionObserver = FakeIntersectionObserver as unknown as typeof IntersectionObserver;

      for (const entry of ENTRIES) {
        const heading = document.createElement('h2');
        heading.id = entry.id;
        document.body.appendChild(heading);
      }
    });

    afterEach(() => {
      globalThis.IntersectionObserver = original;
      document.querySelectorAll('h2[id]').forEach(el => el.remove());
    });

    it('observes the headings the outline lists, and only those', () => {
      render<Props>(TEMPLATE, { imports: [XuiTocImports], props: { entries: ENTRIES, spy: true } });

      expect(FakeIntersectionObserver.last?.observed.map(el => el.id)).toEqual(['what-it-is', 'using-it', 'a-detail']);
    });

    it('activates the first heading inside the band', () => {
      const { queryAll, detect } = render<Props>(TEMPLATE, {
        imports: [XuiTocImports],
        props: { entries: ENTRIES, spy: true }
      });

      FakeIntersectionObserver.last?.emit('using-it', 'a-detail');
      detect();

      expectAttributes(queryAll('a')[1], { 'aria-current': 'location' });
    });

    it('keeps the last heading active while none is in the band', () => {
      const { queryAll, detect } = render<Props>(TEMPLATE, {
        imports: [XuiTocImports],
        props: { entries: ENTRIES, spy: true }
      });

      FakeIntersectionObserver.last?.emit('using-it');
      detect();
      // Scrolled deep into a long section: nothing is in the band any more.
      FakeIntersectionObserver.last?.emit();
      detect();

      expectAttributes(queryAll('a')[1], { 'aria-current': 'location' });
    });

    it('does not observe anything when scroll-spy is off', () => {
      render<Props>(TEMPLATE, { imports: [XuiTocImports], props: { entries: ENTRIES, spy: false } });

      expect(FakeIntersectionObserver.last).toBeUndefined();
    });
  });
});
