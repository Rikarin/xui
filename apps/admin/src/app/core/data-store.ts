import { computed, Injectable, signal } from '@angular/core';
import type { ActivityEntry, Customer, Order, Product } from './models';
import { buildActivity, buildCustomers, buildOrders, buildProducts } from './seed';

/**
 * The application's data, standing in for an HTTP layer.
 *
 * Everything is a signal, and the pages read derived signals rather than being handed arrays —
 * which is the point worth copying: deleting a customer updates one signal here, and the table, the
 * counter in the header and the dashboard total all follow without a subscription anywhere.
 *
 * The first load is deliberately slow. A real admin waits on a network, and the skeletons and empty
 * states that go with waiting are a part of the example rather than an afterthought.
 */
@Injectable({ providedIn: 'root' })
export class DataStore {
  private readonly customersSignal = signal<Customer[]>([]);
  private readonly ordersSignal = signal<Order[]>([]);
  private readonly productsSignal = signal<Product[]>([]);
  private readonly activitySignal = signal<ActivityEntry[]>([]);

  readonly loading = signal(true);

  readonly customers = this.customersSignal.asReadonly();
  readonly orders = this.ordersSignal.asReadonly();
  readonly products = this.productsSignal.asReadonly();
  readonly activity = this.activitySignal.asReadonly();

  readonly customerCount = computed(() => this.customersSignal().length);
  readonly openOrderCount = computed(() => this.ordersSignal().filter(order => order.status === 'pending').length);
  readonly lowStockCount = computed(
    () => this.productsSignal().filter(product => product.stockStatus !== 'in-stock').length
  );

  constructor() {
    setTimeout(() => this.load(), 500);
  }

  private load(): void {
    const customers = buildCustomers();

    this.customersSignal.set(customers);
    this.ordersSignal.set(buildOrders(customers));
    this.productsSignal.set(buildProducts());
    this.activitySignal.set(buildActivity());
    this.loading.set(false);
  }

  customer(id: string): Customer | undefined {
    return this.customersSignal().find(customer => customer.id === id);
  }

  updateCustomer(id: string, patch: Partial<Customer>): void {
    this.customersSignal.update(customers =>
      customers.map(customer => (customer.id === id ? { ...customer, ...patch } : customer))
    );
  }

  removeCustomer(id: string): Customer | undefined {
    const removed = this.customer(id);

    this.customersSignal.update(customers => customers.filter(customer => customer.id !== id));

    return removed;
  }

  /** Puts a removed customer back where it was, so a toast can offer an undo that means something. */
  restoreCustomer(customer: Customer, index: number): void {
    this.customersSignal.update(customers => {
      const next = [...customers];

      next.splice(Math.min(index, next.length), 0, customer);

      return next;
    });
  }

  indexOfCustomer(id: string): number {
    return this.customersSignal().findIndex(customer => customer.id === id);
  }

  updateProduct(id: string, patch: Partial<Product>): void {
    this.productsSignal.update(products =>
      products.map(product => (product.id === id ? { ...product, ...patch } : product))
    );
  }
}
