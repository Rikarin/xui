import type { XDateAdapter } from '@xui/core/date-time';

/** One cell in a month grid. */
export interface XCalendarDay<T> {
  /** The date this cell represents (at the start of the day). */
  date: T;
  /** Day-of-month number, for the label. */
  label: number;
  /** Whether the day belongs to the month being viewed (vs. a leading/trailing day). */
  inCurrentMonth: boolean;
  /** Whether the day is today. */
  isToday: boolean;
  /** Whether the day is out of range or filtered out. */
  disabled: boolean;
}

export interface XBuildMonthOptions<T> {
  min?: T | null;
  max?: T | null;
  dateFilter?: ((date: T) => boolean) | null;
  /** 0 = Sunday (default), 1 = Monday, … */
  firstDayOfWeek?: number;
}

/** A JS `Date` for the given adapter value, for locale-aware `Intl` formatting. */
export const toJsDate = <T>(adapter: XDateAdapter<T>, date: T): Date => new Date(adapter.getTime(date));

const isDisabled = <T>(adapter: XDateAdapter<T>, date: T, options: XBuildMonthOptions<T>): boolean => {
  const day = adapter.startOfDay(date);
  if (options.min && adapter.isBefore(day, adapter.startOfDay(options.min))) {
    return true;
  }
  if (options.max && adapter.isAfter(day, adapter.startOfDay(options.max))) {
    return true;
  }
  return options.dateFilter ? !options.dateFilter(day) : false;
};

/**
 * Build a 6×7 month grid for `viewDate`, including the leading/trailing days that
 * pad the first and last weeks. Pure — all date math goes through the adapter.
 */
export function buildMonthGrid<T>(
  adapter: XDateAdapter<T>,
  viewDate: T,
  options: XBuildMonthOptions<T> = {}
): XCalendarDay<T>[][] {
  const firstDayOfWeek = options.firstDayOfWeek ?? 0;
  const today = adapter.now();
  const monthStart = adapter.startOfDay(adapter.startOfMonth(viewDate));
  const offset = (adapter.getDay(monthStart) - firstDayOfWeek + 7) % 7;
  const gridStart = adapter.subtract(monthStart, { days: offset });

  const weeks: XCalendarDay<T>[][] = [];
  for (let week = 0; week < 6; week++) {
    const row: XCalendarDay<T>[] = [];
    for (let day = 0; day < 7; day++) {
      const date = adapter.add(gridStart, { days: week * 7 + day });
      row.push({
        date,
        label: adapter.getDate(date),
        inCurrentMonth: adapter.isSameMonth(date, viewDate),
        isToday: adapter.isSameDay(date, today),
        disabled: isDisabled(adapter, date, options)
      });
    }
    weeks.push(row);
  }

  return weeks;
}

/**
 * Short weekday labels ordered from `firstDayOfWeek`, e.g. `['Su','Mo',…]` for the
 * given locale.
 */
export function weekdayLabels(firstDayOfWeek = 0, locale?: string): string[] {
  // 2021-08-01 is a Sunday; walk 7 days from there.
  const format = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  const labels: string[] = [];
  for (let i = 0; i < 7; i++) {
    const day = (firstDayOfWeek + i) % 7;
    labels.push(format.format(new Date(Date.UTC(2021, 7, 1 + day))));
  }
  return labels;
}

/** The `month year` heading for a view date, in the given locale. */
export function monthYearLabel<T>(adapter: XDateAdapter<T>, viewDate: T, locale?: string): string {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(toJsDate(adapter, viewDate));
}
