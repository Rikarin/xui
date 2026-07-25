import {
  type ActivityEntry,
  type Channel,
  type Customer,
  type CustomerStatus,
  NOW,
  type Order,
  type OrderStatus,
  type Plan,
  type Product,
  type StockStatus
} from './models';

/**
 * The sample dataset.
 *
 * Generated rather than checked in, and generated from a fixed seed rather than `Math.random()`:
 * five thousand orders would be a tedious fixture to read in a diff, and a dataset that changed on
 * every reload would make the charts and totals impossible to review.
 */

/** mulberry32 — small, fast, and good enough for made-up customers. */
function rng(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;

    let t = Math.imul(state ^ (state >>> 15), 1 | state);

    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST_NAMES = [
  'Ada',
  'Bao',
  'Camila',
  'Dmitri',
  'Elif',
  'Farid',
  'Greta',
  'Hana',
  'Ines',
  'Jonas',
  'Kwame',
  'Lucia',
  'Mateo',
  'Nadia',
  'Omar',
  'Priya',
  'Quinn',
  'Rafael',
  'Saoirse',
  'Tomas',
  'Ursula',
  'Viktor',
  'Wei',
  'Ximena',
  'Yusuf',
  'Zara',
  'Aoife',
  'Bjorn',
  'Chiara',
  'Dario',
  'Emeka',
  'Freya',
  'Gustav',
  'Halima',
  'Ivan',
  'Jae',
  'Karim',
  'Leila',
  'Milo',
  'Noor'
];

const LAST_NAMES = [
  'Abara',
  'Bianchi',
  'Costa',
  'Dubois',
  'Eriksen',
  'Ferreira',
  'Gruber',
  'Haddad',
  'Ivanova',
  'Jensen',
  'Kowalski',
  'Lindqvist',
  'Moreau',
  'Novak',
  'Okafor',
  'Petrov',
  'Quintana',
  'Rossi',
  'Salvatore',
  'Tanaka',
  'Ueda',
  'Vargas',
  'Wagner',
  'Xu',
  'Yilmaz',
  'Zielinski',
  'Andersen',
  'Baptiste',
  'Chen',
  'Delacroix'
];

const COMPANIES = [
  'Meridian Foods',
  'Northwind Traders',
  'Corvus Labs',
  'Halcyon Retail',
  'Ironwood Supply',
  'Juniper Health',
  'Kestrel Media',
  'Lumen Optics',
  'Marabou Coffee',
  'Nimbus Freight',
  'Orchard & Vine',
  'Pallas Robotics',
  'Quarry Stone',
  'Redwood Outfitters',
  'Silverline Rail',
  'Tessellate Design',
  'Umbra Security',
  'Verdant Farms',
  'Wayfarer Travel',
  'Zephyr Marine'
];

const COUNTRIES = [
  'Czechia',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Poland',
  'Netherlands',
  'Sweden',
  'Portugal',
  'Ireland',
  'Japan',
  'Canada',
  'Brazil',
  'Australia',
  'Kenya',
  'Singapore'
];

const PLANS: Plan[] = ['Free', 'Starter', 'Growth', 'Enterprise'];
const CUSTOMER_STATUSES: CustomerStatus[] = ['active', 'active', 'active', 'active', 'invited', 'suspended'];
const ORDER_STATUSES: OrderStatus[] = [
  'paid',
  'paid',
  'paid',
  'paid',
  'shipped',
  'shipped',
  'pending',
  'refunded',
  'failed'
];
const CHANNELS: Channel[] = ['Web', 'Web', 'Web', 'Mobile', 'Mobile', 'Partner', 'In-store'];

const CATEGORIES = ['Beverages', 'Confections', 'Dairy', 'Grains', 'Produce', 'Seafood', 'Preserves'];

const PRODUCT_NAMES = [
  'Cold Brew Concentrate',
  'Single Origin Beans',
  'Matcha Ceremonial',
  'Dark Chocolate 78%',
  'Sea Salt Caramels',
  'Hazelnut Wafers',
  'Aged Gouda',
  'Buffalo Mozzarella',
  'Cultured Butter',
  'Wholegrain Spelt',
  'Sourdough Starter',
  'Semolina Flour',
  'Heirloom Tomatoes',
  'Wild Rocket',
  'Blood Oranges',
  'Line-caught Cod',
  'Smoked Mackerel',
  'Atlantic Scallops',
  'Fig & Walnut Jam',
  'Seville Marmalade',
  'Pickled Walnuts',
  'Elderflower Cordial',
  'Rye Crispbread',
  'Truffle Honey'
];

function pick<T>(random: () => number, values: readonly T[]): T {
  return values[Math.floor(random() * values.length)];
}

function daysBefore(days: number, hoursOffset = 0): Date {
  return new Date(NOW.getTime() - days * 86_400_000 + hoursOffset * 3_600_000);
}

function round(value: number, places = 2): number {
  const factor = 10 ** places;

  return Math.round(value * factor) / factor;
}

export function buildCustomers(count = 64): Customer[] {
  const random = rng(20260701);

  return Array.from({ length: count }, (_unused, index) => {
    const first = pick(random, FIRST_NAMES);
    const last = pick(random, LAST_NAMES);
    const company = pick(random, COMPANIES);
    const plan = pick(random, PLANS);
    const orders = Math.floor(random() * 40) + (plan === 'Enterprise' ? 20 : 1);

    return {
      id: `cus_${(index + 1).toString().padStart(4, '0')}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@${company.split(' ')[0].toLowerCase()}.example`,
      company,
      country: pick(random, COUNTRIES),
      plan,
      status: pick(random, CUSTOMER_STATUSES),
      spend: round(orders * (40 + random() * 260)),
      orders,
      joinedAt: daysBefore(Math.floor(random() * 900) + 20),
      lastSeenAt: daysBefore(Math.floor(random() * 30), Math.floor(random() * 20)),
      notes: ''
    } satisfies Customer;
  });
}

/**
 * Five thousand rows, which is the point: it is the size at which a naive table stops being usable
 * and `xui-data-table`'s virtualisation starts to matter.
 */
export function buildOrders(customers: readonly Customer[], count = 5000): Order[] {
  const random = rng(884422);

  return Array.from({ length: count }, (_unused, index) => {
    const customer = customers[Math.floor(random() * customers.length)];
    const items = Math.floor(random() * 8) + 1;
    // Weekends are quieter, so the revenue chart has a shape rather than noise.
    const day = Math.floor(random() * 120);
    const placedAt = daysBefore(day, Math.floor(random() * 24));
    const weekend = placedAt.getDay() === 0 || placedAt.getDay() === 6;

    return {
      id: `ord_${(index + 1).toString().padStart(5, '0')}`,
      reference: `NW-${(100000 + index).toString()}`,
      customerId: customer.id,
      customerName: customer.name,
      total: round(items * (18 + random() * 90) * (weekend ? 0.7 : 1)),
      items,
      status: pick(random, ORDER_STATUSES),
      channel: pick(random, CHANNELS),
      placedAt
    } satisfies Order;
  }).sort((a, b) => b.placedAt.getTime() - a.placedAt.getTime());
}

export function buildProducts(): Product[] {
  const random = rng(31337);

  return PRODUCT_NAMES.map((name, index) => {
    const stock = Math.floor(random() * 240);
    const stockStatus: StockStatus = stock === 0 ? 'out' : stock < 25 ? 'low' : 'in-stock';

    return {
      id: `prd_${(index + 1).toString().padStart(3, '0')}`,
      name,
      sku: `NW-${name.slice(0, 2).toUpperCase()}-${(index + 1).toString().padStart(3, '0')}`,
      category: CATEGORIES[index % CATEGORIES.length],
      price: round(3 + random() * 40),
      stock,
      stockStatus,
      trend: Array.from({ length: 14 }, () => Math.floor(random() * 40) + 4)
    } satisfies Product;
  });
}

export function buildActivity(): ActivityEntry[] {
  return [
    {
      id: 'a1',
      actor: 'Priya Raman',
      action: 'refunded',
      target: 'NW-100482',
      at: daysBefore(0, -1),
      intent: 'warning'
    },
    {
      id: 'a2',
      actor: 'You',
      action: 'invited',
      target: 'omar.haddad@lumen.example',
      at: daysBefore(0, -3),
      intent: 'primary'
    },
    {
      id: 'a3',
      actor: 'System',
      action: 'flagged',
      target: 'NW-100310 for review',
      at: daysBefore(0, -6),
      intent: 'error'
    },
    {
      id: 'a4',
      actor: 'Tomas Novak',
      action: 'shipped',
      target: '18 orders',
      at: daysBefore(1, -2),
      intent: 'success'
    },
    {
      id: 'a5',
      actor: 'Priya Raman',
      action: 'restocked',
      target: 'Cold Brew Concentrate',
      at: daysBefore(1, -7),
      intent: 'success'
    },
    {
      id: 'a6',
      actor: 'You',
      action: 'changed the plan for',
      target: 'Meridian Foods',
      at: daysBefore(2, -1),
      intent: 'primary'
    }
  ];
}
