import { TestBed } from '@angular/core/testing';
import { XIdSequence, injectUniqueId, resetUniqueIdSequence, resolveId, uniqueId } from './unique-id';

/** Allocate `count` ids under `prefix` from a single application injector. */
const fromOneApplication = (prefix: string, count: number): string[] => {
  const sequence = TestBed.inject(XIdSequence);

  return Array.from({ length: count }, () => sequence.next(prefix));
};

describe('XIdSequence', () => {
  it('never repeats a value within an application', () => {
    expect(new Set(fromOneApplication('xui', 100)).size).toBe(100);
  });

  it('counts each prefix separately', () => {
    const sequence = TestBed.inject(XIdSequence);

    // An id has to hold still while the page around it changes: adding a tooltip
    // somewhere else must not renumber a dialog's title.
    expect(sequence.next('xui-dialog')).toBe('xui-dialog-0');
    expect(sequence.next('xui-tooltip')).toBe('xui-tooltip-0');
    expect(sequence.next('xui-dialog')).toBe('xui-dialog-1');
  });

  it('counts from the same place in every application', () => {
    const first = fromOneApplication('xui-dialog', 2);

    TestBed.resetTestingModule();

    // This is the property the whole thing exists for. Two applications are two
    // server renders of the same page, and they have to agree — asserting that
    // one render looks right passes against a process-wide counter too.
    expect(fromOneApplication('xui-dialog', 2)).toEqual(first);
    expect(first).toEqual(['xui-dialog-0', 'xui-dialog-1']);
  });

  it('produces a valid DOM id', () => {
    // Ids reach `aria-labelledby`, which cannot contain whitespace, and CSS
    // selectors, which cannot start with a digit.
    expect(TestBed.inject(XIdSequence).next('xui-popover')).toMatch(/^[A-Za-z][\w-]*$/);
  });
});

describe('injectUniqueId', () => {
  it('draws from the application it is called in', () => {
    const ids = TestBed.runInInjectionContext(() => [injectUniqueId('xui-tab'), injectUniqueId('xui-tab')]);

    expect(ids).toEqual(['xui-tab-0', 'xui-tab-1']);
  });

  it('defaults to the xui prefix', () => {
    expect(TestBed.runInInjectionContext(() => injectUniqueId())).toBe('xui-0');
  });
});

// The deprecated process-wide pair, kept working for callers outside an
// injection context. Covered so the deprecation stays a deprecation rather than
// a quiet removal.
describe('uniqueId', () => {
  beforeEach(() => resetUniqueIdSequence());

  it('never repeats a value', () => {
    expect(new Set(Array.from({ length: 100 }, () => uniqueId())).size).toBe(100);
  });

  it('uses the supplied prefix', () => {
    expect(uniqueId('xui-dialog')).toBe('xui-dialog-0');
  });

  it('counts every prefix from one sequence', () => {
    // Unlike `XIdSequence`, which is why this one renumbers a component when an
    // unrelated one is added to the page.
    expect(uniqueId('xui-dialog')).toBe('xui-dialog-0');
    expect(uniqueId('xui-tooltip')).toBe('xui-tooltip-1');
  });
});

describe('resolveId', () => {
  beforeEach(() => resetUniqueIdSequence());

  it('keeps a caller-supplied id', () => {
    expect(resolveId('my-id', 'xui-dialog')).toBe('my-id');
  });

  it('generates one when absent', () => {
    expect(resolveId(null, 'xui-dialog')).toBe('xui-dialog-0');
    expect(resolveId(undefined, 'xui-dialog')).toBe('xui-dialog-1');
  });

  it('keeps an empty string rather than treating it as absent', () => {
    // An explicit empty id is a caller mistake worth surfacing, not something
    // to paper over with a generated value.
    expect(resolveId('', 'xui-dialog')).toBe('');
  });
});
