import { resetUniqueIdSequence, resolveId, uniqueId } from './unique-id';

beforeEach(() => resetUniqueIdSequence());

describe('uniqueId', () => {
  it('never repeats a value', () => {
    const ids = new Set(Array.from({ length: 100 }, () => uniqueId()));

    expect(ids.size).toBe(100);
  });

  it('uses the supplied prefix', () => {
    expect(uniqueId('xui-dialog')).toBe('xui-dialog-0');
  });

  it('produces a valid DOM id', () => {
    // Ids are used in aria-labelledby, which cannot contain whitespace.
    expect(uniqueId('xui-popover')).toMatch(/^[A-Za-z][\w-]*$/);
  });
});

describe('resolveId', () => {
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
