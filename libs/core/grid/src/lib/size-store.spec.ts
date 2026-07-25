import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { indexAtPosition, positionAtIndex, sizeAtIndex, visibleRange } from './locator';
import { createGridSizeStore } from './size-store';

const make = (count: number, defaultSize: number, minSize?: number) =>
  TestBed.runInInjectionContext(() => createGridSizeStore({ count: signal(count), defaultSize, minSize }));

describe('createGridSizeStore', () => {
  it('returns the default size for un-overridden indices', () => {
    const store = make(5, 100);

    expect(store.size(0)).toBe(100);
    expect(store.total()).toBe(500);
    expect(store.offsets()).toEqual([0, 100, 200, 300, 400, 500]);
  });

  it('applies an override and reflects it in offsets and total', () => {
    const store = make(3, 100);

    store.setSize(1, 250);

    expect(store.size(1)).toBe(250);
    expect(store.offsets()).toEqual([0, 100, 350, 450]);
    expect(store.total()).toBe(450);
  });

  it('clamps an override to the minimum size', () => {
    const store = make(3, 100, 40);

    store.setSize(0, 5);

    expect(store.size(0)).toBe(40);
  });

  it('clears an override back to the default', () => {
    const store = make(3, 100);
    store.setSize(2, 200);
    expect(store.size(2)).toBe(200);

    store.clearSize(2);

    expect(store.size(2)).toBe(100);
    expect(store.total()).toBe(300);
  });

  it('reacts to a changing count', () => {
    const count = signal(2);
    const store = TestBed.runInInjectionContext(() => createGridSizeStore({ count, defaultSize: 50 }));
    expect(store.total()).toBe(100);

    count.set(4);

    expect(store.total()).toBe(200);
  });
});

describe('locator', () => {
  const offsets = [0, 100, 350, 450]; // widths 100, 250, 100

  it('finds the index at a pixel position', () => {
    expect(indexAtPosition(offsets, 0)).toBe(0);
    expect(indexAtPosition(offsets, 99)).toBe(0);
    expect(indexAtPosition(offsets, 100)).toBe(1);
    expect(indexAtPosition(offsets, 349)).toBe(1);
    expect(indexAtPosition(offsets, 350)).toBe(2);
    // Clamps past the end to the last index.
    expect(indexAtPosition(offsets, 9999)).toBe(2);
  });

  it('finds the position and size at an index', () => {
    expect(positionAtIndex(offsets, 2)).toBe(350);
    expect(sizeAtIndex(offsets, 1)).toBe(250);
    expect(sizeAtIndex(offsets, 2)).toBe(100);
    expect(sizeAtIndex(offsets, -1)).toBe(0);
  });

  it('computes the visible range for a viewport with overscan', () => {
    // uniform 50px rows, 20 of them
    const uniform = Array.from({ length: 21 }, (_, i) => i * 50);

    expect(visibleRange(uniform, 0, 200)).toEqual([0, 4]);
    expect(visibleRange(uniform, 225, 200)).toEqual([4, 8]);
    // overscan pads both ends, clamped to bounds
    expect(visibleRange(uniform, 0, 200, 2)).toEqual([0, 6]);
    expect(visibleRange(uniform, 900, 200, 2)).toEqual([16, 19]);
  });

  it('handles an empty grid', () => {
    expect(indexAtPosition([0], 10)).toBe(-1);
    expect(visibleRange([0], 0, 100)).toEqual([0, -1]);
  });
});
