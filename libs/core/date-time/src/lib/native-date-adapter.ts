import type { XDateAdapter, XDateUnits, XDuration } from './date-adapter';

/** Most to least significant — the order the defaulting rule in `create` walks. */
const UNITS = [
  'year',
  'month',
  'day',
  'hour',
  'minute',
  'second',
  'millisecond'
] as const satisfies readonly (keyof XDateUnits)[];

export class XNativeDateAdapter implements XDateAdapter<Date> {
  /**
   * Create a new date time object.
   *
   * Units coarser than the most significant one given are taken from today;
   * finer ones bottom out. So `{ year, month, day }` is midnight on that day
   * rather than today's clock time with the date swapped — which also makes the
   * result depend only on its arguments. Passing nothing at all means now.
   *
   * This is Luxon's `fromObject` rule, and it has to be, or the two adapters
   * would answer differently for the same call.
   */
  create(values: XDateUnits): Date {
    const now = new Date();
    const significant = UNITS.findIndex(unit => values[unit] !== undefined);

    const resolve = (unit: (typeof UNITS)[number], floor: number, today: number): number =>
      values[unit] ?? (significant === -1 || UNITS.indexOf(unit) < significant ? today : floor);

    return new Date(
      // Nothing is coarser than the year, so its floor is only ever reached when
      // no unit was given at all — in which case every unit comes from `now`.
      resolve('year', now.getFullYear(), now.getFullYear()),
      resolve('month', 0, now.getMonth()),
      resolve('day', 1, now.getDate()),
      resolve('hour', 0, now.getHours()),
      resolve('minute', 0, now.getMinutes()),
      resolve('second', 0, now.getSeconds()),
      resolve('millisecond', 0, now.getMilliseconds())
    );
  }

  /**
   * Create a new date with the current date and time.
   */
  now(): Date {
    return new Date();
  }

  /**
   * Set the year of the date time object based on a duration.
   */
  set(date: Date, values: XDateUnits): Date {
    return new Date(
      values.year ?? date.getFullYear(),
      values.month ?? date.getMonth(),
      values.day ?? date.getDate(),
      values.hour ?? date.getHours(),
      values.minute ?? date.getMinutes(),
      values.second ?? date.getSeconds(),
      values.millisecond ?? date.getMilliseconds()
    );
  }

  /**
   * Add a duration to the date time object.
   */
  add(date: Date, duration: XDuration): Date {
    return this.shift(date, duration, 1);
  }

  /**
   * Subtract a duration from the date time object
   */
  subtract(date: Date, duration: XDuration): Date {
    return this.shift(date, duration, -1);
  }

  /**
   * Move `date` by `duration`, in the direction `sign` gives.
   *
   * Years and months land on a month first and the day is then clamped into it, so a month after
   * 31 March is 30 April rather than a roll-over into May — which is what `new Date(y, m + 1, 31)`
   * would have given, and what made a two-month calendar seeded on the 31st skip a month. The
   * remaining units are true durations and are free to carry into the next day or month.
   */
  private shift(date: Date, duration: XDuration, sign: 1 | -1): Date {
    const anchor = new Date(
      date.getFullYear() + (duration.years ?? 0) * sign,
      date.getMonth() + (duration.months ?? 0) * sign,
      1
    );
    // Day 0 of the following month is the last day of this one.
    const daysInTargetMonth = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate();

    return new Date(
      anchor.getFullYear(),
      anchor.getMonth(),
      Math.min(date.getDate(), daysInTargetMonth) + (duration.days ?? 0) * sign,
      date.getHours() + (duration.hours ?? 0) * sign,
      date.getMinutes() + (duration.minutes ?? 0) * sign,
      date.getSeconds() + (duration.seconds ?? 0) * sign,
      date.getMilliseconds() + (duration.milliseconds ?? 0) * sign
    );
  }

  /**
   * Compare two date time objects
   */
  compare(a: Date, b: Date): number {
    const diff = a.getTime() - b.getTime();
    return diff === 0 ? 0 : diff > 0 ? 1 : -1;
  }

  /**
   * Determine if two date time objects are equal.
   */
  isEqual(a: Date, b: Date): boolean {
    return a.getTime() === b.getTime();
  }

  /**
   * Determine if a date time object is before another.
   */
  isBefore(a: Date, b: Date): boolean {
    return a.getTime() < b.getTime();
  }

  /**
   * Determine if a date time object is after another.
   */
  isAfter(a: Date, b: Date): boolean {
    return a.getTime() > b.getTime();
  }

  /**
   * Determine if two date objects are on the same day.
   */
  isSameDay(a: Date, b: Date): boolean {
    return this.isSameYear(a, b) && this.isSameMonth(a, b) && a.getDate() === b.getDate();
  }

  /**
   * Determine if two date objects are on the same month.
   */
  isSameMonth(a: Date, b: Date): boolean {
    return this.isSameYear(a, b) && a.getMonth() === b.getMonth();
  }

  /**
   * Determine if two date objects are on the same year.
   */
  isSameYear(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear();
  }

  /**
   * Get the year.
   */
  getYear(date: Date): number {
    return date.getFullYear();
  }

  /**
   * Get the month.
   */
  getMonth(date: Date): number {
    return date.getMonth();
  }

  /**
   * Get the day.
   */
  getDay(date: Date): number {
    return date.getDay();
  }

  /**
   * Get the date.
   */
  getDate(date: Date): number {
    return date.getDate();
  }

  /**
   * Get the hours.
   */
  getHours(date: Date): number {
    return date.getHours();
  }

  /**
   * Get the minutes.
   */
  getMinutes(date: Date): number {
    return date.getMinutes();
  }

  /**
   * Get the seconds.
   */
  getSeconds(date: Date): number {
    return date.getSeconds();
  }

  /**
   * Get the milliseconds.
   */
  getMilliseconds(date: Date): number {
    return date.getMilliseconds();
  }

  /**
   * Get the first day of the month.
   */
  startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  /**
   * Get the last day of the month.
   */
  endOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }

  /**
   * Get the start of the day.
   */
  startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  /**
   * Get the end of the day.
   */
  endOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
  }

  /**
   * Get the time.
   */
  getTime(date: Date): number {
    return date.getTime();
  }
}
