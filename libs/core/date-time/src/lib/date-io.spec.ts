import { defaultXDateFormat, defaultXDateParse } from './date-io';
import { XNativeDateAdapter } from './native-date-adapter';

describe('defaultXDateFormat', () => {
  const format = defaultXDateFormat(new XNativeDateAdapter());

  it('formats as a locale short date', () => {
    expect(format(new Date(2026, 6, 26), 'en-US')).toBe('07/26/2026');
  });

  it('honours the locale argument', () => {
    expect(format(new Date(2026, 6, 26), 'de-DE')).toBe('26.07.2026');
  });
});

describe('defaultXDateParse', () => {
  it('parses best-effort via Date.parse', () => {
    const parsed = defaultXDateParse<Date>('2026-07-26T00:00:00');

    expect(parsed).toBeInstanceOf(Date);
    expect(parsed?.getFullYear()).toBe(2026);
    expect(parsed?.getMonth()).toBe(6);
    expect(parsed?.getDate()).toBe(26);
  });

  it('returns null for unparseable text', () => {
    expect(defaultXDateParse('not a date')).toBeNull();
  });
});
