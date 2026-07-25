import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createQueryList } from './query-list';

interface Item {
  name: string;
  disabled?: boolean;
}

const ITEMS: Item[] = [{ name: 'Apple' }, { name: 'Banana', disabled: true }, { name: 'Cherry' }, { name: 'Date' }];

// createQueryList builds signals, so run it inside an injection context.
const make = (query = '', items = ITEMS) =>
  TestBed.runInInjectionContext(() => {
    const q = signal(query);
    const list = createQueryList<Item>({
      items: signal(items),
      query: q,
      itemText: i => i.name,
      itemDisabled: i => !!i.disabled
    });
    return { q, list };
  });

describe('createQueryList', () => {
  it('returns every item when the query is empty', () => {
    const { list } = make();

    expect(list.filteredItems().map(i => i.name)).toEqual(['Apple', 'Banana', 'Cherry', 'Date']);
  });

  it('filters case-insensitively on the item text by default', () => {
    const { list } = make('an');

    expect(list.filteredItems().map(i => i.name)).toEqual(['Banana']);
  });

  it('honours a custom itemPredicate', () => {
    const custom = TestBed.runInInjectionContext(() =>
      createQueryList<Item>({
        items: signal(ITEMS),
        query: signal('C'),
        itemPredicate: (query, item) => item.name.startsWith(query)
      })
    );

    expect(custom.filteredItems().map(i => i.name)).toEqual(['Cherry']);
  });

  it('honours a whole-list predicate', () => {
    const list = TestBed.runInInjectionContext(() =>
      createQueryList<Item>({
        items: signal(ITEMS),
        query: signal('anything'),
        itemListPredicate: () => [ITEMS[3]]
      })
    );

    expect(list.filteredItems().map(i => i.name)).toEqual(['Date']);
  });

  it('activates the first enabled item and skips disabled ones', () => {
    const { list } = make();

    expect(list.activeItem()?.name).toBe('Apple');

    list.moveActiveItem(1); // Apple -> (Banana disabled) -> Cherry
    expect(list.activeItem()?.name).toBe('Cherry');
  });

  it('wraps around when moving past the ends', () => {
    const { list } = make();

    list.moveActiveItem(-1); // from Apple, wrap back skipping disabled Banana -> Date
    expect(list.activeItem()?.name).toBe('Date');
  });

  it('re-seeds the active item when the filter changes', () => {
    const { q, list } = make();
    list.setActiveItem(ITEMS[2]); // Cherry
    expect(list.activeItem()?.name).toBe('Cherry');

    q.set('date'); // Cherry no longer present → first result (Date)
    expect(list.activeItem()?.name).toBe('Date');
  });

  it('keeps the active item across a filter change when it survives', () => {
    const { q, list } = make();
    list.setActiveItem(ITEMS[2]); // Cherry

    q.set('r'); // Cherry still matches
    expect(list.activeItem()?.name).toBe('Cherry');
  });

  it('refuses to activate a disabled item', () => {
    const { list } = make();

    list.setActiveItem(ITEMS[1]); // Banana (disabled)
    expect(list.activeItem()?.name).toBe('Apple');
  });
});
