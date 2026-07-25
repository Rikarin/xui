import { computed, type Signal, signal, type WritableSignal } from '@angular/core';

export interface GridSizeStoreConfig {
  count: Signal<number>;
  /** The fallback size for un-overridden indices. May be reactive. */
  defaultSize: number | Signal<number>;
  minSize?: number;
}

const asSignal = (value: number | Signal<number>): Signal<number> =>
  typeof value === 'function' ? value : computed(() => value);

/**
 * A signal-backed store of per-index sizes (used for both column widths and row
 * heights). Only overridden indices are stored; the rest fall back to
 * `defaultSize`. Exposes cumulative `offsets` and a `total`, which the locator
 * uses to map between an index and a pixel position.
 */
export interface GridSizeStore {
  /** Size of the index, honouring overrides and the default. */
  size(index: number): number;
  /** Set (override) the size of one index, clamped to `minSize`. */
  setSize(index: number, size: number): void;
  /** Remove an override so the index reverts to the default. */
  clearSize(index: number): void;
  /** Cumulative start offsets: `offsets()[i]` is the pixel where index `i` begins. Length = count + 1. */
  readonly offsets: Signal<number[]>;
  /** Total pixel size across every index. */
  readonly total: Signal<number>;
  /** The raw override map (for persistence / testing). */
  readonly overrides: WritableSignal<ReadonlyMap<number, number>>;
}

export function createGridSizeStore(config: GridSizeStoreConfig): GridSizeStore {
  const minSize = config.minSize ?? 0;
  const defaultSize = asSignal(config.defaultSize);
  const overrides = signal<ReadonlyMap<number, number>>(new Map());

  const size = (index: number): number => overrides().get(index) ?? defaultSize();

  const offsets = computed(() => {
    const count = config.count();
    const map = overrides();
    const fallback = defaultSize();
    const result: number[] = new Array(count + 1);
    result[0] = 0;
    for (let i = 0; i < count; i++) {
      result[i + 1] = result[i] + (map.get(i) ?? fallback);
    }
    return result;
  });

  const total = computed(() => {
    const list = offsets();
    return list[list.length - 1] ?? 0;
  });

  return {
    size,
    setSize: (index, value) => {
      const next = new Map(overrides());
      next.set(index, Math.max(minSize, value));
      overrides.set(next);
    },
    clearSize: index => {
      if (!overrides().has(index)) {
        return;
      }
      const next = new Map(overrides());
      next.delete(index);
      overrides.set(next);
    },
    offsets,
    total,
    overrides
  };
}
