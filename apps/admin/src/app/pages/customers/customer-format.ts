import type { Customer, CustomerStatus } from '../../core/models';

const STATUS_COLOR: Record<CustomerStatus, 'success' | 'warning' | 'error'> = {
  active: 'success',
  invited: 'warning',
  suspended: 'error'
};

/** Maps a customer status onto the tag colour both the table and the drawer use. */
export function statusColor(status: CustomerStatus): 'success' | 'warning' | 'error' {
  return STATUS_COLOR[status];
}

/** Two-letter initials for the avatar, shared by the table rows and the detail drawer. */
export function customerInitials(customer: Customer): string {
  return customer.name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2);
}
