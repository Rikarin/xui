import { averageOrderValue, byChannel, daily, orderCount, refundRate, revenue, topCustomers } from './metrics';
import { NOW, type Order } from './models';

const DAY = 86_400_000;

function order(partial: Partial<Order> & { daysAgo: number }): Order {
  const { daysAgo, ...rest } = partial;

  return {
    id: 'ord_1',
    reference: 'NW-1',
    customerId: 'cus_1',
    customerName: 'Ada Abara',
    total: 100,
    items: 1,
    status: 'paid',
    channel: 'Web',
    placedAt: new Date(NOW.getTime() - daysAgo * DAY),
    ...rest
  };
}

describe('revenue', () => {
  it('counts paid and shipped, and nothing else', () => {
    const orders = [
      order({ daysAgo: 1, total: 100, status: 'paid' }),
      order({ daysAgo: 2, total: 50, status: 'shipped' }),
      order({ daysAgo: 3, total: 999, status: 'refunded' }),
      order({ daysAgo: 4, total: 999, status: 'failed' }),
      order({ daysAgo: 5, total: 999, status: 'pending' })
    ];

    expect(revenue(orders).value).toBe(150);
  });

  it('compares against the window before it', () => {
    const orders = [order({ daysAgo: 1, total: 200 }), order({ daysAgo: 40, total: 100 })];

    expect(revenue(orders, 30).change).toBe(100);
  });

  it('reports 100% rather than dividing by zero on a fresh account', () => {
    expect(revenue([order({ daysAgo: 1, total: 10 })], 30).change).toBe(100);
    expect(revenue([], 30).change).toBe(0);
  });
});

describe('orderCount', () => {
  it('counts every status, unlike revenue', () => {
    const orders = [order({ daysAgo: 1, status: 'refunded' }), order({ daysAgo: 2, status: 'failed' })];

    expect(orderCount(orders).value).toBe(2);
  });
});

describe('averageOrderValue', () => {
  it('averages only what was earned', () => {
    const orders = [
      order({ daysAgo: 1, total: 100 }),
      order({ daysAgo: 2, total: 200 }),
      order({ daysAgo: 3, total: 9000, status: 'refunded' })
    ];

    expect(averageOrderValue(orders).value).toBe(150);
  });

  it('is zero rather than NaN with nothing to average', () => {
    expect(averageOrderValue([]).value).toBe(0);
  });
});

describe('refundRate', () => {
  it('is a percentage of all orders in the window', () => {
    const orders = [
      order({ daysAgo: 1, status: 'refunded' }),
      order({ daysAgo: 2 }),
      order({ daysAgo: 3 }),
      order({ daysAgo: 4 })
    ];

    expect(refundRate(orders).value).toBe(25);
  });
});

describe('daily', () => {
  it('emits one point per day, oldest first, including empty ones', () => {
    const points = daily([order({ daysAgo: 2, total: 60 })], 5);

    expect(points).toHaveLength(5);
    expect(points[0].date.getTime()).toBeLessThan(points[4].date.getTime());
    expect(points.filter(point => point.revenue > 0)).toHaveLength(1);
    expect(points.reduce((sum, point) => sum + point.revenue, 0)).toBe(60);
  });

  it('leaves an order outside the window out of the buckets', () => {
    expect(daily([order({ daysAgo: 90, total: 60 })], 5).every(point => point.revenue === 0)).toBe(true);
  });
});

describe('byChannel', () => {
  it('totals earned revenue per channel, largest first', () => {
    const orders = [
      order({ daysAgo: 1, channel: 'Web', total: 100 }),
      order({ daysAgo: 2, channel: 'Mobile', total: 250 }),
      order({ daysAgo: 3, channel: 'Web', total: 100 }),
      order({ daysAgo: 4, channel: 'Partner', total: 900, status: 'failed' })
    ];

    expect(byChannel(orders)).toEqual([
      { name: 'Mobile', value: 250 },
      { name: 'Web', value: 200 }
    ]);
  });
});

describe('topCustomers', () => {
  it('ranks by earned total and honours the limit', () => {
    const orders = [
      order({ daysAgo: 1, customerName: 'Ada', total: 100 }),
      order({ daysAgo: 2, customerName: 'Bao', total: 300 }),
      order({ daysAgo: 3, customerName: 'Ada', total: 100 }),
      order({ daysAgo: 4, customerName: 'Cai', total: 50 })
    ];

    expect(topCustomers(orders, 2)).toEqual([
      { name: 'Bao', total: 300 },
      { name: 'Ada', total: 200 }
    ]);
  });
});
