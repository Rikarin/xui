import { signal } from '@angular/core';
import { createXActiveOption, createXItemListPredicate, defaultXItemMatch, trackXItem } from './option-list';
import { createXQueryList } from './query-list';

interface Item {
  name: string;
  disabled?: boolean;
}

const ITEMS: Item[] = [{ name: 'Apple' }, { name: 'Banana', disabled: true }, { name: 'Cherry' }, { name: 'Date' }];

const key = (name: string): KeyboardEvent => new KeyboardEvent('keydown', { key: name, cancelable: true });

const make = (config: { open?: () => void; closeOnTab?: boolean; preventEscapeDefault?: boolean } = {}) => {
  const query = signal('');
  const list = createXQueryList<Item>({
    items: signal(ITEMS),
    query,
    itemText: i => i.name,
    itemDisabled: i => !!i.disabled
  });
  const selected: Item[] = [];
  let closed = 0;
  const nav = createXActiveOption<Item>({
    list,
    select: item => selected.push(item),
    close: () => closed++,
    ...config
  });
  return { query, list, nav, selected, closed: () => closed };
};

describe('defaultXItemMatch', () => {
  it('matches case-insensitive substrings', () => {
    expect(defaultXItemMatch('Banana', 'NAN')).toBe(true);
    expect(defaultXItemMatch('Banana', 'x')).toBe(false);
  });
});

describe('trackXItem', () => {
  it('tracks by item, falling back to the index for nullish items', () => {
    expect(trackXItem(3, 'a')).toBe('a');
    expect(trackXItem(3, null)).toBe(3);
  });
});

describe('createXItemListPredicate', () => {
  it('filters with the default matcher over itemText when no predicate is set', () => {
    const filter = createXItemListPredicate<Item>({ itemText: signal(i => i.name) });

    expect(filter('an', ITEMS).map(i => i.name)).toEqual(['Banana']);
    expect(filter('', ITEMS)).toEqual(ITEMS);
  });

  it('prefers the whole-list predicate, then the per-item predicate', () => {
    const filter = createXItemListPredicate<Item>({
      itemText: signal(i => i.name),
      itemPredicate: signal((q, item) => item.name.startsWith(q)),
      itemListPredicate: signal(undefined)
    });
    expect(filter('C', ITEMS).map(i => i.name)).toEqual(['Cherry']);

    const ranked = createXItemListPredicate<Item>({
      itemText: signal(i => i.name),
      itemListPredicate: signal(() => [ITEMS[3]])
    });
    expect(ranked('anything', ITEMS).map(i => i.name)).toEqual(['Date']);
  });
});

describe('createXActiveOption', () => {
  it('moves the active item with ArrowDown/ArrowUp, skipping disabled items', () => {
    const { list, nav } = make();
    expect(nav.activeIndex()).toBe(0); // Apple

    expect(nav.onKeydown(key('ArrowDown'))).toBe(true); // skips disabled Banana
    expect(list.activeItem()?.name).toBe('Cherry');
    expect(nav.activeIndex()).toBe(2);

    nav.onKeydown(key('ArrowUp'));
    expect(list.activeItem()?.name).toBe('Apple');
  });

  it('invokes the open callback on ArrowDown', () => {
    let opened = 0;
    const { nav } = make({ open: () => opened++ });

    nav.onKeydown(key('ArrowDown'));
    expect(opened).toBe(1);
    nav.onKeydown(key('ArrowUp'));
    expect(opened).toBe(1);
  });

  it('selects the active item on Enter', () => {
    const { nav, selected } = make();
    const event = key('Enter');

    expect(nav.onKeydown(event)).toBe(true);
    expect(selected.map(i => i.name)).toEqual(['Apple']);
    expect(event.defaultPrevented).toBe(true);
  });

  it('closes on Escape, preventing its default only when asked', () => {
    const plain = make();
    const escape = key('Escape');
    plain.nav.onKeydown(escape);
    expect(plain.closed()).toBe(1);
    expect(escape.defaultPrevented).toBe(false);

    const modal = make({ preventEscapeDefault: true });
    const modalEscape = key('Escape');
    modal.nav.onKeydown(modalEscape);
    expect(modal.closed()).toBe(1);
    expect(modalEscape.defaultPrevented).toBe(true);
  });

  it('closes on Tab only when closeOnTab is set, leaving other keys unhandled', () => {
    const loose = make();
    expect(loose.nav.onKeydown(key('Tab'))).toBe(false);
    expect(loose.closed()).toBe(0);
    expect(loose.nav.onKeydown(key('a'))).toBe(false);

    const strict = make({ closeOnTab: true });
    expect(strict.nav.onKeydown(key('Tab'))).toBe(true);
    expect(strict.closed()).toBe(1);
  });

  it('setActive and reset drive the underlying list', () => {
    const { nav, list } = make();

    nav.setActive(ITEMS[2]);
    expect(list.activeItem()?.name).toBe('Cherry');

    nav.reset();
    expect(list.activeItem()?.name).toBe('Apple');

    nav.setActive(ITEMS[1]); // disabled — ignored
    expect(list.activeItem()?.name).toBe('Apple');
  });
});
