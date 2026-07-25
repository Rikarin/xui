/**
 * Maps between grid indices and pixel positions using a cumulative `offsets`
 * array (as produced by {@link GridSizeStore.offsets}). `offsets[i]` is the pixel
 * where index `i` begins; the array has `count + 1` entries.
 */

/** The index whose span contains pixel `position` (clamped to `[0, count - 1]`). */
export function indexAtPosition(offsets: readonly number[], position: number): number {
  const count = offsets.length - 1;
  if (count <= 0) {
    return -1;
  }
  if (position <= 0) {
    return 0;
  }
  if (position >= offsets[count]) {
    return count - 1;
  }

  // Binary search for the last offset that is <= position.
  let lo = 0;
  let hi = count;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (offsets[mid] <= position) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return lo - 1;
}

/** The pixel where index `i` begins. */
export function positionAtIndex(offsets: readonly number[], index: number): number {
  const clamped = Math.max(0, Math.min(offsets.length - 1, index));
  return offsets[clamped];
}

/** The size (span) of index `i`. */
export function sizeAtIndex(offsets: readonly number[], index: number): number {
  if (index < 0 || index >= offsets.length - 1) {
    return 0;
  }
  return offsets[index + 1] - offsets[index];
}

/**
 * The inclusive `[first, last]` index range visible in a viewport starting at
 * `scroll` with `viewportSize` pixels, padded by `overscan` indices on each side.
 */
export function visibleRange(
  offsets: readonly number[],
  scroll: number,
  viewportSize: number,
  overscan = 0
): [number, number] {
  const count = offsets.length - 1;
  if (count <= 0) {
    return [0, -1];
  }

  const first = Math.max(0, indexAtPosition(offsets, scroll) - overscan);
  const last = Math.min(count - 1, indexAtPosition(offsets, scroll + viewportSize) + overscan);
  return [first, last];
}
