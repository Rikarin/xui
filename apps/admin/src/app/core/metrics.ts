import { NOW, type Order } from './models';

/**
 * Everything the dashboard shows, derived from the orders rather than stored beside them.
 *
 * Pure functions over a plain array, so they are testable without a component, a fixture or a
 * TestBed — `metrics.spec.ts` covers them directly.
 */

export interface Trend {
  value: number;
  /** Percentage change against the preceding window of the same length. */
  change: number;
}

const DAY = 86_400_000;

function within(orders: readonly Order[], fromDaysAgo: number, toDaysAgo: number): Order[] {
  const from = NOW.getTime() - fromDaysAgo * DAY;
  const to = NOW.getTime() - toDaysAgo * DAY;

  return orders.filter(order => order.placedAt.getTime() >= from && order.placedAt.getTime() < to);
}

function change(current: number, previous: number): number {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return Math.round(((current - previous) / previous) * 1000) / 10;
}

/** Orders that count towards money taken: a refund or a failure did not earn anything. */
function earned(orders: readonly Order[]): Order[] {
  return orders.filter(order => order.status === 'paid' || order.status === 'shipped');
}

export function revenue(orders: readonly Order[], days = 30): Trend {
  const current = earned(within(orders, days, 0)).reduce((sum, order) => sum + order.total, 0);
  const previous = earned(within(orders, days * 2, days)).reduce((sum, order) => sum + order.total, 0);

  return { value: Math.round(current), change: change(current, previous) };
}

export function orderCount(orders: readonly Order[], days = 30): Trend {
  const current = within(orders, days, 0).length;
  const previous = within(orders, days * 2, days).length;

  return { value: current, change: change(current, previous) };
}

export function averageOrderValue(orders: readonly Order[], days = 30): Trend {
  const current = earned(within(orders, days, 0));
  const previous = earned(within(orders, days * 2, days));
  const mean = (list: readonly Order[]) =>
    list.length === 0 ? 0 : list.reduce((sum, order) => sum + order.total, 0) / list.length;

  return { value: Math.round(mean(current) * 100) / 100, change: change(mean(current), mean(previous)) };
}

export function refundRate(orders: readonly Order[], days = 30): Trend {
  const rate = (list: readonly Order[]) =>
    list.length === 0 ? 0 : (list.filter(order => order.status === 'refunded').length / list.length) * 100;
  const current = rate(within(orders, days, 0));
  const previous = rate(within(orders, days * 2, days));

  return { value: Math.round(current * 10) / 10, change: change(current, previous) };
}

export interface DailyPoint {
  date: Date;
  label: string;
  revenue: number;
  orders: number;
}

/** One point per day, oldest first, with empty days present so the axis stays honest. */
export function daily(orders: readonly Order[], days = 30): DailyPoint[] {
  const buckets = new Map<string, DailyPoint>();

  for (let offset = days - 1; offset >= 0; offset--) {
    const date = new Date(NOW.getTime() - offset * DAY);
    const key = date.toISOString().slice(0, 10);

    buckets.set(key, {
      date,
      label: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      revenue: 0,
      orders: 0
    });
  }

  for (const order of within(orders, days, 0)) {
    const bucket = buckets.get(order.placedAt.toISOString().slice(0, 10));

    if (!bucket) {
      continue;
    }

    bucket.orders++;

    if (order.status === 'paid' || order.status === 'shipped') {
      bucket.revenue += order.total;
    }
  }

  return [...buckets.values()].map(point => ({ ...point, revenue: Math.round(point.revenue) }));
}

export function byChannel(orders: readonly Order[], days = 30): { name: string; value: number }[] {
  const totals = new Map<string, number>();

  for (const order of earned(within(orders, days, 0))) {
    totals.set(order.channel, (totals.get(order.channel) ?? 0) + order.total);
  }

  return [...totals.entries()]
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value);
}

export function byStatus(orders: readonly Order[], days = 30): { name: string; value: number }[] {
  const counts = new Map<string, number>();

  for (const order of within(orders, days, 0)) {
    counts.set(order.status, (counts.get(order.status) ?? 0) + 1);
  }

  return [...counts.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

export function topCustomers(orders: readonly Order[], limit = 5, days = 30): { name: string; total: number }[] {
  const totals = new Map<string, number>();

  for (const order of earned(within(orders, days, 0))) {
    totals.set(order.customerName, (totals.get(order.customerName) ?? 0) + order.total);
  }

  return [...totals.entries()]
    .map(([name, total]) => ({ name, total: Math.round(total) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}
