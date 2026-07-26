/** The shapes the example trades in. Nothing here is xUI-specific — it is just the domain. */

export type CustomerStatus = 'active' | 'invited' | 'suspended';
export type Plan = 'Free' | 'Starter' | 'Growth' | 'Enterprise';

export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  country: string;
  plan: Plan;
  status: CustomerStatus;
  /** Lifetime spend in whole currency units. */
  spend: number;
  orders: number;
  joinedAt: Date;
  lastSeenAt: Date;
  notes: string;
}

export type OrderStatus = 'paid' | 'pending' | 'shipped' | 'refunded' | 'failed';
export type Channel = 'Web' | 'Mobile' | 'Partner' | 'In-store';

export interface Order {
  id: string;
  reference: string;
  customerId: string;
  customerName: string;
  total: number;
  items: number;
  status: OrderStatus;
  channel: Channel;
  placedAt: Date;
}

export type StockStatus = 'in-stock' | 'low' | 'out';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  stockStatus: StockStatus;
  /** Units sold in the last 30 days, for the sparkline. */
  trend: number[];
}

export interface ActivityEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: Date;
  /** Matches `XuiTimelineColor`, so the dashboard's timeline can bind it straight through. */
  intent: 'primary' | 'success' | 'warning' | 'error';
}

/**
 * The clock the sample data is generated against.
 *
 * Fixed rather than `new Date()` so every reload, screenshot and test sees the same figures — a
 * demo whose numbers drift is a demo nobody can review.
 */
export const NOW = new Date('2026-07-01T09:00:00Z');
