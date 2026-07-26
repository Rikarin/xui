import type { XDateAdapter } from './date-adapter';

/**
 * The default `formatDate` of the date input components: a locale short date
 * (`year`/`2-digit` month/`2-digit` day) via `Intl.DateTimeFormat`, converting
 * the adapter's value to a JS `Date` first.
 */
export function defaultXDateFormat<T>(adapter: XDateAdapter<T>): (date: T, locale?: string) => string {
  return (date, locale) =>
    new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(
      new Date(adapter.getTime(date))
    );
}

/**
 * The default `parseDate` of the date input components: best-effort
 * `Date.parse`, `null` when the text is not parseable.
 */
export const defaultXDateParse = <T = Date>(text: string): T | null => {
  const ms = Date.parse(text);
  return Number.isNaN(ms) ? null : (new Date(ms) as unknown as T);
};
