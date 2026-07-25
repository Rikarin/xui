export interface NavItem {
  label: string;
  path: string;
  icon: string;
  /** Shown as a tag in the sidebar — a count that wants attention. */
  badge?: 'customers' | 'orders' | 'stock';
  /** Extra words the command palette should match on, beyond the label. */
  keywords?: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

/**
 * One description of the navigation, read by the sidebar, the mobile drawer and the command
 * palette.
 *
 * Keeping it in one place is the reason ⌘K can offer every destination without anyone remembering
 * to add it twice.
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Overview',
    items: [
      {
        label: 'Dashboard',
        path: '/dashboard',
        icon: 'matSpaceDashboardRound',
        keywords: 'home metrics revenue charts'
      }
    ]
  },
  {
    label: 'Commerce',
    items: [
      {
        label: 'Customers',
        path: '/customers',
        icon: 'matPeopleRound',
        badge: 'customers',
        keywords: 'people accounts users'
      },
      {
        label: 'Orders',
        path: '/orders',
        icon: 'matReceiptLongRound',
        badge: 'orders',
        keywords: 'sales transactions refunds'
      },
      {
        label: 'Products',
        path: '/products',
        icon: 'matInventory2Round',
        badge: 'stock',
        keywords: 'catalogue stock inventory'
      }
    ]
  },
  {
    label: 'Workspace',
    items: [
      { label: 'Settings', path: '/settings', icon: 'matSettingsRound', keywords: 'profile notifications billing team' }
    ]
  }
];

export const NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap(section => section.items);
