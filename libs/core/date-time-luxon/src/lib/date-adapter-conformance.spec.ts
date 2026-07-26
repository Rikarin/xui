import { XDateAdapter, XNativeDateAdapter } from '@xui/core/date-time';
import { XLuxonDateAdapter } from './date-adapter';

/**
 * Runs the same contract against every adapter implementation, so the
 * implementations cannot drift apart (0-based months, endOfMonth at the
 * start of the last day, and so on).
 */
function describeConformance<T>(name: string, adapter: XDateAdapter<T>) {
  describe(name, () => {
    it('creates a date from 0-based month units', () => {
      const date = adapter.create({ year: 2024, month: 0, day: 15, hour: 0, minute: 0, second: 0, millisecond: 0 });

      expect(adapter.getYear(date)).toBe(2024);
      expect(adapter.getMonth(date)).toBe(0);
      expect(adapter.getDate(date)).toBe(15);
    });

    it('returns months between 0 (January) and 11 (December)', () => {
      const january = adapter.create({ year: 2024, month: 0, day: 1 });
      const december = adapter.create({ year: 2024, month: 11, day: 1 });

      expect(adapter.getMonth(january)).toBe(0);
      expect(adapter.getMonth(december)).toBe(11);
    });

    it('sets a 0-based month', () => {
      const january = adapter.create({ year: 2024, month: 0, day: 15 });
      const june = adapter.set(january, { month: 5 });

      expect(adapter.getMonth(june)).toBe(5);
      expect(adapter.getYear(june)).toBe(2024);
      expect(adapter.getDate(june)).toBe(15);
    });

    it('creates the same instant as the native adapter for the same units', () => {
      const units = { year: 2024, month: 6, day: 4, hour: 12, minute: 30, second: 15, millisecond: 250 };
      const date = adapter.create(units);
      const reference = new XNativeDateAdapter().create(units);

      expect(adapter.getTime(date)).toBe(reference.getTime());
    });

    it('returns the last day of the month at the start of that day from endOfMonth', () => {
      const leapFebruary = adapter.create({ year: 2024, month: 1, day: 10, hour: 8, minute: 30 });
      const end = adapter.endOfMonth(leapFebruary);

      expect(adapter.getDate(end)).toBe(29);
      expect(adapter.getMonth(end)).toBe(1);
      expect(adapter.getHours(end)).toBe(0);
      expect(adapter.getMinutes(end)).toBe(0);
      expect(adapter.getSeconds(end)).toBe(0);
      expect(adapter.getMilliseconds(end)).toBe(0);
    });

    it('returns the first day of the month from startOfMonth', () => {
      const date = adapter.create({ year: 2024, month: 3, day: 18, hour: 9 });
      const start = adapter.startOfMonth(date);

      expect(adapter.getDate(start)).toBe(1);
      expect(adapter.getMonth(start)).toBe(3);
    });

    it('returns the bounds of the day from startOfDay and endOfDay', () => {
      const date = adapter.create({ year: 2024, month: 3, day: 18, hour: 9, minute: 41 });
      const start = adapter.startOfDay(date);
      const end = adapter.endOfDay(date);

      expect(adapter.getHours(start)).toBe(0);
      expect(adapter.getMinutes(start)).toBe(0);
      expect(adapter.getHours(end)).toBe(23);
      expect(adapter.getMinutes(end)).toBe(59);
      expect(adapter.getSeconds(end)).toBe(59);
      expect(adapter.getMilliseconds(end)).toBe(999);
      expect(adapter.getDate(start)).toBe(18);
      expect(adapter.getDate(end)).toBe(18);
    });

    it('returns days of the week between 0 (Sunday) and 6', () => {
      const sunday = adapter.create({ year: 2024, month: 0, day: 14 });
      const monday = adapter.create({ year: 2024, month: 0, day: 15 });
      const saturday = adapter.create({ year: 2024, month: 0, day: 20 });

      expect(adapter.getDay(sunday)).toBe(0);
      expect(adapter.getDay(monday)).toBe(1);
      expect(adapter.getDay(saturday)).toBe(6);
    });

    it('adds and subtracts durations across month boundaries', () => {
      const january = adapter.create({ year: 2024, month: 0, day: 31 });
      const plusOneDay = adapter.add(january, { days: 1 });
      const minusOneMonth = adapter.subtract(adapter.create({ year: 2024, month: 2, day: 15 }), { months: 1 });

      expect(adapter.getMonth(plusOneDay)).toBe(1);
      expect(adapter.getDate(plusOneDay)).toBe(1);
      expect(adapter.getMonth(minusOneMonth)).toBe(1);
    });

    it('compares dates', () => {
      const earlier = adapter.create({ year: 2024, month: 0, day: 1 });
      const later = adapter.create({ year: 2024, month: 0, day: 2 });
      const same = adapter.create({ year: 2024, month: 0, day: 1 });

      expect(adapter.compare(earlier, later)).toBe(-1);
      expect(adapter.compare(later, earlier)).toBe(1);
      expect(adapter.compare(earlier, same)).toBe(0);
      expect(adapter.isBefore(earlier, later)).toBe(true);
      expect(adapter.isAfter(later, earlier)).toBe(true);
      expect(adapter.isEqual(earlier, same)).toBe(true);
    });

    it('matches days, months and years with the isSame* helpers', () => {
      const morning = adapter.create({ year: 2024, month: 4, day: 12, hour: 8 });
      const evening = adapter.create({ year: 2024, month: 4, day: 12, hour: 20 });
      const nextDay = adapter.create({ year: 2024, month: 4, day: 13 });
      const nextMonth = adapter.create({ year: 2024, month: 5, day: 12 });
      const nextYear = adapter.create({ year: 2025, month: 4, day: 12 });

      expect(adapter.isSameDay(morning, evening)).toBe(true);
      expect(adapter.isSameDay(morning, nextDay)).toBe(false);
      expect(adapter.isSameMonth(morning, nextDay)).toBe(true);
      expect(adapter.isSameMonth(morning, nextMonth)).toBe(false);
      expect(adapter.isSameYear(morning, nextMonth)).toBe(true);
      expect(adapter.isSameYear(morning, nextYear)).toBe(false);
    });

    it('reads time-of-day units back', () => {
      const date = adapter.create({ year: 2024, month: 7, day: 9, hour: 13, minute: 37, second: 42, millisecond: 7 });

      expect(adapter.getHours(date)).toBe(13);
      expect(adapter.getMinutes(date)).toBe(37);
      expect(adapter.getSeconds(date)).toBe(42);
      expect(adapter.getMilliseconds(date)).toBe(7);
    });
  });
}

describe('XDateAdapter conformance', () => {
  describeConformance('XNativeDateAdapter', new XNativeDateAdapter());
  describeConformance('XLuxonDateAdapter', new XLuxonDateAdapter());
});
