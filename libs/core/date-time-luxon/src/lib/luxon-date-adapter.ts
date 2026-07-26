import { XDateAdapter, XDateUnits, XDuration } from '@xui/core/date-time';
import { DateTime } from 'luxon';

export class XLuxonDateAdapter implements XDateAdapter<DateTime> {
  now() {
    return DateTime.now();
  }

  set(date: DateTime, values: XDateUnits) {
    // XDateUnits.month is 0-based; Luxon months are 1-based.
    return date.set(values.month === undefined ? values : { ...values, month: values.month + 1 });
  }

  add(date: DateTime, duration: XDuration) {
    return date.plus(duration);
  }

  subtract(date: DateTime, duration: XDuration) {
    return date.minus(duration);
  }

  compare(a: DateTime, b: DateTime): number {
    if (a < b) {
      return -1;
    }

    if (a > b) {
      return 1;
    }

    return 0;
  }

  isEqual(a: DateTime, b: DateTime): boolean {
    return a.equals(b);
  }

  isBefore(a: DateTime, b: DateTime): boolean {
    return a < b;
  }

  isAfter(a: DateTime, b: DateTime): boolean {
    return a > b;
  }

  isSameDay(a: DateTime, b: DateTime): boolean {
    return a.hasSame(b, 'day') && a.hasSame(b, 'month') && a.hasSame(b, 'year');
  }

  isSameMonth(a: DateTime, b: DateTime): boolean {
    return a.hasSame(b, 'month') && a.hasSame(b, 'year');
  }

  isSameYear(a: DateTime, b: DateTime): boolean {
    return a.hasSame(b, 'year');
  }

  getYear(date: DateTime): number {
    return date.year;
  }

  getMonth(date: DateTime): number {
    // XDateAdapter months are 0-based; Luxon months are 1-based.
    return date.month - 1;
  }

  getDate(date: DateTime): number {
    return date.day;
  }

  getDay(date: DateTime): number {
    return date.weekday % 7;
  }

  getHours(date: DateTime): number {
    return date.hour;
  }

  getMinutes(date: DateTime): number {
    return date.minute;
  }

  getSeconds(date: DateTime): number {
    return date.second;
  }

  getMilliseconds(date: DateTime): number {
    return date.millisecond;
  }

  getTime(date: DateTime<boolean>): number {
    return date.toMillis();
  }

  startOfMonth(date: DateTime) {
    return date.startOf('month');
  }

  endOfMonth(date: DateTime) {
    return date.endOf('month').startOf('day');
  }

  startOfDay(date: DateTime) {
    return date.startOf('day');
  }

  endOfDay(date: DateTime) {
    return date.endOf('day');
  }

  create(values: XDateUnits) {
    // XDateUnits.month is 0-based; Luxon months are 1-based.
    return DateTime.fromObject(values.month === undefined ? values : { ...values, month: values.month + 1 });
  }
}
