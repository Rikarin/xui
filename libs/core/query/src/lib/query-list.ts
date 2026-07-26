import { computed, linkedSignal, type Signal, signal } from '@angular/core';

/** Configuration for {@link createXQueryList}. */
export interface XQueryListConfig<T> {
  /** The full item set. */
  items: Signal<readonly T[]>;

  /** The current query string used to filter. */
  query: Signal<string>;

  /**
   * Keep an item when it matches the query. Mutually exclusive with
   * `itemListPredicate`; if neither is given, `itemText` drives a default
   * case-insensitive substring match.
   */
  itemPredicate?: (query: string, item: T) => boolean;

  /** Filter the whole list at once (e.g. for fuzzy ranking). Wins over `itemPredicate`. */
  itemListPredicate?: (query: string, items: readonly T[]) => T[];

  /** Extract an item's text for the default predicate and typeahead. */
  itemText?: (item: T) => string;

  /** Whether an item cannot be activated/selected. */
  itemDisabled?: (item: T) => boolean;
}

/** A headless, signal-driven filtered list with an active (highlighted) item. */
export interface XQueryList<T> {
  /** The items surviving the current query. */
  readonly filteredItems: Signal<readonly T[]>;

  /** The active (keyboard-highlighted) item, or `null`. */
  readonly activeItem: Signal<T | null>;

  /** Whether the given item is the active one. */
  isActive(item: T): boolean;

  /** Whether the given item is disabled per `itemDisabled`. */
  isDisabled(item: T): boolean;

  /** Set the active item explicitly (ignored if disabled). */
  setActiveItem(item: T | null): void;

  /** Move the active item by `direction`, skipping disabled items and wrapping. */
  moveActiveItem(direction: 1 | -1): void;

  /** Activate the first enabled filtered item (or clear if none). */
  activateFirst(): void;
}

const defaultText = (item: unknown): string => (item == null ? '' : String(item));

export function createXQueryList<T>(config: XQueryListConfig<T>): XQueryList<T> {
  const itemText = config.itemText ?? defaultText;
  const itemDisabled = config.itemDisabled ?? (() => false);

  const filteredItems = computed<readonly T[]>(() => {
    const items = config.items();
    const query = config.query().trim();

    if (config.itemListPredicate) {
      return config.itemListPredicate(query, items);
    }

    if (!query) {
      return items;
    }

    if (config.itemPredicate) {
      return items.filter(item => config.itemPredicate!(query, item));
    }

    const needle = query.toLowerCase();
    return items.filter(item => itemText(item).toLowerCase().includes(needle));
  });

  // Reset the active item to the first enabled result whenever the results change.
  const active = linkedSignal<readonly T[], T | null>({
    source: filteredItems,
    computation: (items, previous) => {
      // Keep the previous active item if it survived the new filter.
      if (previous && items.includes(previous.value as T)) {
        return previous.value as T;
      }

      return items.find(item => !itemDisabled(item)) ?? null;
    }
  });

  const indexOfActive = () => {
    const items = filteredItems();
    const current = active();
    return current == null ? -1 : items.indexOf(current);
  };

  return {
    filteredItems,
    activeItem: active.asReadonly(),

    isActive: (item: T) => active() === item,
    isDisabled: (item: T) => itemDisabled(item),

    setActiveItem: (item: T | null) => {
      if (item == null || !itemDisabled(item)) {
        active.set(item);
      }
    },

    moveActiveItem: (direction: 1 | -1) => {
      const items = filteredItems();
      if (!items.length) {
        return;
      }

      let index = indexOfActive();
      // Walk in `direction`, wrapping, until we land on an enabled item (or give up).
      for (let step = 0; step < items.length; step++) {
        index = (index + direction + items.length) % items.length;
        if (!itemDisabled(items[index])) {
          active.set(items[index]);
          return;
        }
      }
    },

    activateFirst: () => {
      active.set(filteredItems().find(item => !itemDisabled(item)) ?? null);
    }
  };
}

// A tiny helper used by consumers that want a writable query signal alongside the list.
export const createXQuerySignal = () => signal('');
