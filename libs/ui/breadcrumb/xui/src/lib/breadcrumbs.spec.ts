import { expectAttributes, render } from '@xui/testing';
import type { XuiBreadcrumbData } from './breadcrumbs';
import { XuiBreadcrumbs, XuiBreadcrumbsCurrent, XuiBreadcrumbsItem, XuiBreadcrumbsOverflow } from './breadcrumbs';

const IMPORTS = [XuiBreadcrumbs, XuiBreadcrumbsItem, XuiBreadcrumbsCurrent, XuiBreadcrumbsOverflow];

const ITEMS: XuiBreadcrumbData[] = [
  { text: 'Home', href: '/' },
  { text: 'Projects', href: '/projects' },
  { text: 'xui' }
];

interface Props {
  items: XuiBreadcrumbData[];
  onClick: (item: XuiBreadcrumbData) => void;
}

const setup = (template: string, props: Partial<Props> = {}) =>
  render<Props>(template, { imports: IMPORTS, props: { items: ITEMS, onClick: () => undefined, ...props } });

/** Drops the copies the overflow list keeps off-screen to measure with. */
const rendered = (host: HTMLElement, selector: string) =>
  [...host.querySelectorAll(selector)].filter(node => !node.closest('[aria-hidden="true"]'));

const crumbs = (host: HTMLElement) => rendered(host, '[role="listitem"]');

describe('XuiBreadcrumbs', () => {
  it('renders one crumb per item', () => {
    const { host } = setup('<xui-breadcrumbs [items]="props().items" />');

    expect(crumbs(host).map(node => node.textContent?.trim())).toEqual(['Home', 'Projects', 'xui']);
  });

  it('is a labelled navigation landmark holding a list', () => {
    const { query } = setup('<xui-breadcrumbs [items]="props().items" />');

    // The wrappers the overflow list lays items out in would otherwise break
    // the chain between the list and its items.
    expectAttributes(query('xui-breadcrumbs'), { role: 'navigation', 'aria-label': 'breadcrumb' });
    expectAttributes(query('xui-overflow-list'), { role: 'list' });
  });

  it('marks the last crumb as the current page', () => {
    const { host } = setup('<xui-breadcrumbs [items]="props().items" />');

    expect(crumbs(host).at(-1)?.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('xui');
  });

  it('lets an item claim the current page for itself', () => {
    const { host } = setup('<xui-breadcrumbs [items]="props().items" />', {
      items: [{ text: 'Home', current: true }, { text: 'Projects' }]
    });

    expect(crumbs(host)[0].querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('Home');
  });

  it('renders a crumb with an href as a link and one without as plain text', () => {
    const { host } = setup('<xui-breadcrumbs [items]="props().items" />', {
      items: [{ text: 'Home', href: '/' }, { text: 'Orphan' }, { text: 'Here' }]
    });

    expect(crumbs(host)[0].querySelector('a')?.getAttribute('href')).toBe('/');
    expect(crumbs(host)[1].querySelector('a')).toBeNull();
  });

  it('does not need a router when no item routes', () => {
    // The link part used to compose RouterLink as a host directive, which made
    // every trail fail without a Router in the injector. Nothing here provides
    // one, so this test is the guard.
    expect(() => setup('<xui-breadcrumbs [items]="props().items" />')).not.toThrow();
  });

  it('separates the crumbs but does not lead with a separator', () => {
    const { host } = setup('<xui-breadcrumbs [items]="props().items" />');

    expect(crumbs(host).map(node => node.querySelectorAll('[role="presentation"]').length)).toEqual([0, 1, 1]);
  });

  it('emits the item behind a navigable crumb when it is activated', () => {
    const seen: XuiBreadcrumbData[] = [];
    const { host, click } = setup('<xui-breadcrumbs [items]="props().items" (itemClick)="props().onClick($event)" />', {
      onClick: item => seen.push(item)
    });

    click(host.querySelector('a') as HTMLElement);

    expect(seen).toEqual([ITEMS[0]]);
  });

  it('marks a disabled crumb as unreachable', () => {
    const { host } = setup('<xui-breadcrumbs [items]="props().items" />', {
      items: [{ text: 'Gone', href: '/gone', disabled: true }, { text: 'Here' }]
    });

    expectAttributes(host.querySelector('a') as HTMLElement, { 'aria-disabled': 'true', tabindex: '-1' });
  });

  it('takes over the rendering of every crumb', () => {
    const { host } = setup(`
      <xui-breadcrumbs [items]="props().items">
        <ng-template xuiBreadcrumbsItem let-item let-current="current">
          <b>{{ item.text }}{{ current ? '!' : '' }}</b>
        </ng-template>
      </xui-breadcrumbs>
    `);

    expect(rendered(host, 'b').map(node => node.textContent)).toEqual(['Home', 'Projects', 'xui!']);
  });

  it('takes over the current crumb alone', () => {
    const { host } = setup(`
      <xui-breadcrumbs [items]="props().items">
        <ng-template xuiBreadcrumbsCurrent let-item><b>{{ item.text }}</b></ng-template>
      </xui-breadcrumbs>
    `);

    expect(rendered(host, 'b').map(node => node.textContent)).toEqual(['xui']);
  });
});
