/** An inclusive `[start, end]` index interval. */
export type XCellInterval = [number, number];

/**
 * A rectangular selection over a grid. `null` on an axis means "the whole axis":
 * a full-row region spans every column (`cols: null`), a full-column region spans
 * every row (`rows: null`), and the full-table region is `null` on both.
 */
export interface XRegion {
  rows: XCellInterval | null;
  cols: XCellInterval | null;
}

export type XRegionCardinality = 'cell' | 'full-row' | 'full-column' | 'full-table';

const order = (interval: XCellInterval): XCellInterval =>
  interval[0] <= interval[1] ? interval : [interval[1], interval[0]];

/** A region covering a single cell (or a rectangular block of cells). */
export function cellRegion(rowStart: number, colStart: number, rowEnd = rowStart, colEnd = colStart): XRegion {
  return { rows: order([rowStart, rowEnd]), cols: order([colStart, colEnd]) };
}

/** A region covering entire rows (all columns). */
export function rowRegion(rowStart: number, rowEnd = rowStart): XRegion {
  return { rows: order([rowStart, rowEnd]), cols: null };
}

/** A region covering entire columns (all rows). */
export function columnRegion(colStart: number, colEnd = colStart): XRegion {
  return { rows: null, cols: order([colStart, colEnd]) };
}

/** The region covering the whole table. */
export function tableRegion(): XRegion {
  return { rows: null, cols: null };
}

/** Sort each interval so `start <= end`. */
export function normalizeRegion(region: XRegion): XRegion {
  return {
    rows: region.rows ? order(region.rows) : null,
    cols: region.cols ? order(region.cols) : null
  };
}

export function getRegionCardinality(region: XRegion): XRegionCardinality {
  if (region.rows && region.cols) {
    return 'cell';
  }
  if (region.rows) {
    return 'full-row';
  }
  if (region.cols) {
    return 'full-column';
  }
  return 'full-table';
}

const inInterval = (interval: XCellInterval | null, index: number): boolean => {
  if (interval === null) {
    return true;
  }
  const [lo, hi] = order(interval);
  return index >= lo && index <= hi;
};

/** Whether a region contains the given cell. */
export function regionContainsCell(region: XRegion, row: number, col: number): boolean {
  return inInterval(region.rows, row) && inInterval(region.cols, col);
}

/** Whether a region fully contains an entire row. */
export function regionContainsRow(region: XRegion, row: number): boolean {
  return region.cols === null && inInterval(region.rows, row);
}

/** Whether a region fully contains an entire column. */
export function regionContainsColumn(region: XRegion, col: number): boolean {
  return region.rows === null && inInterval(region.cols, col);
}

const intervalsEqual = (a: XCellInterval | null, b: XCellInterval | null): boolean => {
  if (a === null || b === null) {
    return a === b;
  }
  const [a0, a1] = order(a);
  const [b0, b1] = order(b);
  return a0 === b0 && a1 === b1;
};

export function regionsEqual(a: XRegion, b: XRegion): boolean {
  return intervalsEqual(a.rows, b.rows) && intervalsEqual(a.cols, b.cols);
}

/** Whether any region in the list contains the cell. */
export function anyRegionContainsCell(regions: readonly XRegion[], row: number, col: number): boolean {
  return regions.some(region => regionContainsCell(region, row, col));
}

/**
 * Resolve a region to inclusive `[rowStart, rowEnd, colStart, colEnd]` bounds,
 * expanding whole-axis (`null`) intervals to the full extent and clamping to the
 * grid size. Used to materialize a region (e.g. copy-to-clipboard).
 */
export function regionBounds(region: XRegion, rowCount: number, colCount: number): [number, number, number, number] {
  const rows = region.rows ? order(region.rows) : ([0, rowCount - 1] as XCellInterval);
  const cols = region.cols ? order(region.cols) : ([0, colCount - 1] as XCellInterval);
  return [Math.max(0, rows[0]), Math.min(rowCount - 1, rows[1]), Math.max(0, cols[0]), Math.min(colCount - 1, cols[1])];
}

/**
 * Add `region` to `regions`, or remove it if an equal region is already present
 * (toggle semantics used by ctrl/cmd-click selection).
 */
export function toggleRegion(regions: readonly XRegion[], region: XRegion): XRegion[] {
  const normalized = normalizeRegion(region);
  const existing = regions.findIndex(r => regionsEqual(r, normalized));
  if (existing >= 0) {
    return regions.filter((_, i) => i !== existing);
  }
  return [...regions, normalized];
}
