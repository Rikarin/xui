import { NOW } from './models';

/** "3 minutes ago", "2 days ago" — coarse on purpose, because an admin rarely needs the second. */
export function relativeTime(date: Date, now: Date = NOW): string {
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);

  if (seconds < 0) {
    return 'just now';
  }

  const steps: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, 'second'],
    [3600, 'minute'],
    [86400, 'hour'],
    [604800, 'day'],
    [2629800, 'week'],
    [31557600, 'month']
  ];

  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  let previous = 1;

  for (const [limit, unit] of steps) {
    if (seconds < limit) {
      return formatter.format(-Math.floor(seconds / previous), unit);
    }

    previous = limit;
  }

  return formatter.format(-Math.floor(seconds / 31557600), 'year');
}

const MONEY = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const MONEY_EXACT = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR' });

export function money(value: number, exact = false): string {
  return (exact ? MONEY_EXACT : MONEY).format(value);
}

/** A signed percentage, for the "up 12.4% on last month" line under a statistic. */
export function signedPercent(value: number): string {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
}
