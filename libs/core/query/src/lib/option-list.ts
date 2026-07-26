import { computed, type Signal } from '@angular/core';
import type { XQueryList } from './query-list';

/** The default item/query matcher: a case-insensitive substring match. */
export const defaultXItemMatch = (text: string, query: string): boolean =>
  text.toLowerCase().includes(query.toLowerCase());

/** `track` function for option lists: the item itself, falling back to the index for nullish items. */
export const trackXItem = (index: number, item: unknown): unknown => item ?? index;

/** Configuration for {@link createXItemListPredicate}. */
export interface XItemListPredicateConfig<T> {
  /** Extract an item's text for the default matcher. */
  itemText: Signal<(item: T) => string>;

  /** A per-item predicate configured by the consumer, if any. */
  itemPredicate?: Signal<((query: string, item: T) => boolean) | undefined>;

  /** A whole-list predicate configured by the consumer (e.g. fuzzy ranking). Wins over `itemPredicate`. */
  itemListPredicate?: Signal<((query: string, items: readonly T[]) => T[]) | undefined>;
}

/**
 * Build the standard `itemListPredicate` the option components feed into
 * {@link createXQueryList}: a consumer-supplied whole-list predicate wins,
 * else an empty query passes everything, else the consumer's per-item
 * predicate (or {@link defaultXItemMatch} over `itemText`) filters.
 */
export function createXItemListPredicate<T>(
  config: XItemListPredicateConfig<T>
): (query: string, items: readonly T[]) => T[] {
  return (query, items) => {
    const listPredicate = config.itemListPredicate?.();
    if (listPredicate) {
      return listPredicate(query, items);
    }

    if (!query) {
      return items as T[];
    }

    const predicate = config.itemPredicate?.();
    return items.filter(item =>
      predicate ? predicate(query, item) : defaultXItemMatch(config.itemText()(item), query)
    );
  };
}

/** Configuration for {@link createXActiveOption}. */
export interface XActiveOptionConfig<T> {
  /** The query list whose active item the keyboard drives. */
  list: XQueryList<T>;

  /** Commit the active item (Enter). */
  select: (item: T) => void;

  /** Dismiss the list (Escape, and Tab when `closeOnTab`). */
  close: () => void;

  /** Called on ArrowDown before moving — typeaheads open their popover here. */
  open?: () => void;

  /** Also dismiss on Tab (a select trigger yielding focus). */
  closeOnTab?: boolean;

  /** Prevent Escape's default action (modal surfaces such as a command palette). */
  preventEscapeDefault?: boolean;
}

/** The keyboard-navigation half of an option list. */
export interface XActiveOption<T> {
  /** Index of the active item within the filtered items, or `-1`. */
  readonly activeIndex: Signal<number>;

  /** Handle ArrowUp/ArrowDown/Enter/Escape(/Tab). Returns whether the key was consumed. */
  onKeydown(event: KeyboardEvent): boolean;

  /** Activate the given item (ignored when disabled). */
  setActive(item: T | null): void;

  /** Re-seed the active item to the first enabled result. */
  reset(): void;
}

/**
 * The shared keyboard-navigation reducer for query-list driven option lists
 * (select, suggest, multi-select, omnibar): ArrowUp/ArrowDown move the active
 * item, Enter commits it, Escape (and optionally Tab) dismisses.
 */
export function createXActiveOption<T>(config: XActiveOptionConfig<T>): XActiveOption<T> {
  const { list } = config;

  return {
    activeIndex: computed(() => {
      const active = list.activeItem();
      return active == null ? -1 : list.filteredItems().indexOf(active);
    }),

    onKeydown: (event: KeyboardEvent): boolean => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          config.open?.();
          list.moveActiveItem(1);
          return true;
        case 'ArrowUp':
          event.preventDefault();
          list.moveActiveItem(-1);
          return true;
        case 'Enter': {
          event.preventDefault();
          const active = list.activeItem();
          if (active != null) {
            config.select(active);
          }
          return true;
        }
        case 'Escape':
          if (config.preventEscapeDefault) {
            event.preventDefault();
          }
          config.close();
          return true;
        case 'Tab':
          if (config.closeOnTab) {
            config.close();
            return true;
          }
          return false;
        default:
          return false;
      }
    },

    setActive: item => list.setActiveItem(item),
    reset: () => list.activateFirst()
  };
}
