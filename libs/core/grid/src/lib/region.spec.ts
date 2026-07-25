import {
  anyRegionContainsCell,
  cellRegion,
  columnRegion,
  getRegionCardinality,
  normalizeRegion,
  regionBounds,
  regionContainsCell,
  regionContainsColumn,
  regionContainsRow,
  regionsEqual,
  rowRegion,
  tableRegion,
  toggleRegion
} from './region';

describe('region constructors and cardinality', () => {
  it('builds a single-cell region', () => {
    expect(cellRegion(2, 3)).toEqual({ rows: [2, 2], cols: [3, 3] });
    expect(getRegionCardinality(cellRegion(2, 3))).toBe('cell');
  });

  it('builds full-row / full-column / full-table regions', () => {
    expect(getRegionCardinality(rowRegion(1, 4))).toBe('full-row');
    expect(getRegionCardinality(columnRegion(0, 2))).toBe('full-column');
    expect(getRegionCardinality(tableRegion())).toBe('full-table');
  });

  it('normalizes reversed intervals', () => {
    expect(normalizeRegion({ rows: [5, 2], cols: [4, 1] })).toEqual({ rows: [2, 5], cols: [1, 4] });
  });
});

describe('containment', () => {
  it('checks a cell against a block region', () => {
    const region = cellRegion(1, 1, 3, 3);

    expect(regionContainsCell(region, 2, 2)).toBe(true);
    expect(regionContainsCell(region, 0, 2)).toBe(false);
    expect(regionContainsCell(region, 2, 4)).toBe(false);
  });

  it('treats a full-row region as spanning every column', () => {
    const region = rowRegion(2, 2);

    expect(regionContainsCell(region, 2, 99)).toBe(true);
    expect(regionContainsRow(region, 2)).toBe(true);
    expect(regionContainsRow(region, 3)).toBe(false);
    // A cell region does not "contain" a whole row.
    expect(regionContainsRow(cellRegion(2, 0), 2)).toBe(false);
  });

  it('treats a full-column region as spanning every row', () => {
    const region = columnRegion(1);

    expect(regionContainsCell(region, 99, 1)).toBe(true);
    expect(regionContainsColumn(region, 1)).toBe(true);
    expect(regionContainsColumn(region, 0)).toBe(false);
  });

  it('a full-table region contains everything', () => {
    expect(regionContainsCell(tableRegion(), 100, 100)).toBe(true);
  });

  it('anyRegionContainsCell scans a list', () => {
    const regions = [columnRegion(0), rowRegion(5)];

    expect(anyRegionContainsCell(regions, 5, 3)).toBe(true); // row 5
    expect(anyRegionContainsCell(regions, 2, 0)).toBe(true); // column 0
    expect(anyRegionContainsCell(regions, 2, 3)).toBe(false);
  });
});

describe('equality and toggling', () => {
  it('compares regions irrespective of interval order', () => {
    expect(regionsEqual(cellRegion(1, 1, 3, 3), { rows: [3, 1], cols: [3, 1] })).toBe(true);
    expect(regionsEqual(rowRegion(1), columnRegion(1))).toBe(false);
  });

  it('adds a new region', () => {
    const result = toggleRegion([], cellRegion(0, 0));

    expect(result).toHaveLength(1);
    expect(regionsEqual(result[0], cellRegion(0, 0))).toBe(true);
  });

  it('removes an equal region (toggle off)', () => {
    const start = [cellRegion(0, 0), cellRegion(1, 1)];

    const result = toggleRegion(start, cellRegion(0, 0));

    expect(result).toHaveLength(1);
    expect(regionsEqual(result[0], cellRegion(1, 1))).toBe(true);
  });
});
