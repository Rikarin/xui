import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  matAddRound,
  matArrowDownwardRound,
  matArrowUpwardRound,
  matBlockRound,
  matDeleteRound,
  matDownloadRound,
  matMailRound,
  matMoreVertRound,
  matPersonRound,
  matSearchRound
} from '@ng-icons/material-icons/round';
import { XuiAvatarImports } from '@xui/avatar';
import { XuiButtonImports } from '@xui/button';
import { XuiIconImports } from '@xui/icon';
import { XuiInputImports } from '@xui/input';
import { XuiMenuImports } from '@xui/menu';
import { XuiNonIdealStateImports } from '@xui/non-ideal-state';
import { XuiPaginationImports } from '@xui/pagination';
import { XuiSelectImports } from '@xui/select';
import { XuiSkeletonImports } from '@xui/skeleton';
import { XuiTableImports } from '@xui/table';
import { XuiTagImports } from '@xui/tag';
import { XuiToastService } from '@xui/toast';
import { DataStore } from '../../core/data-store';
import { money } from '../../core/format';
import type { Customer, CustomerStatus, Plan } from '../../core/models';
import { PageHeader } from '../../shell/page-header';
import { CustomerDeleteDialog } from './customer-delete-dialog';
import { CustomerDetailDrawer } from './customer-detail-drawer';
import { customerInitials, statusColor } from './customer-format';
import { CustomerInviteDialog } from './customer-invite-dialog';

type SortKey = 'name' | 'company' | 'orders' | 'spend';

const ALL = 'All';

/**
 * The list-and-detail page every admin has, with the parts that usually get skipped.
 *
 * Filtering, sorting and paging are one `computed()` chain over the store's signal — change a
 * filter and the row count, the pager and the empty state all follow, with no subscription and no
 * lifecycle hook. The pieces of view state are separate signals on purpose, so changing a filter
 * can reset the page index without also resetting the sort.
 *
 * The modal surfaces are child components — {@link CustomerDetailDrawer},
 * {@link CustomerInviteDialog}, {@link CustomerDeleteDialog} — that own their open state and drafts,
 * while every store mutation and toast stays here, next to the data they change.
 *
 * Deleting is the part worth copying: an alert dialog to confirm, then a toast whose action puts
 * the row back at the index it came from. Destructive and reversible beats a second confirmation.
 */
@Component({
  selector: 'app-customers',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    NgIcon,
    XuiAvatarImports,
    XuiButtonImports,
    XuiIconImports,
    XuiInputImports,
    XuiMenuImports,
    XuiNonIdealStateImports,
    XuiPaginationImports,
    XuiSelectImports,
    XuiSkeletonImports,
    XuiTableImports,
    XuiTagImports,
    CustomerDeleteDialog,
    CustomerDetailDrawer,
    CustomerInviteDialog,
    PageHeader
  ],
  providers: [
    provideIcons({
      matSearchRound,
      matAddRound,
      matDownloadRound,
      matMoreVertRound,
      matPersonRound,
      matMailRound,
      matBlockRound,
      matDeleteRound,
      matArrowUpwardRound,
      matArrowDownwardRound
    })
  ],
  template: `
    <app-page-header title="Customers" [description]="summary()">
      <button xuiButton variant="outline" type="button" (click)="exportCsv()">
        <ng-icon xui name="matDownloadRound" />
        Export
      </button>
      <button xuiButton type="button" (click)="inviteOpen.set(true)">
        <ng-icon xui name="matAddRound" />
        Invite
      </button>
    </app-page-header>

    <div class="mb-4 flex flex-wrap items-center gap-2">
      <xui-input-group class="w-full sm:w-72">
        <ng-icon xuiInputLeftElement xui name="matSearchRound" />
        <input
          xuiInput
          type="search"
          class="w-full"
          placeholder="Search name, email or company…"
          aria-label="Search customers"
          [ngModel]="query()"
          (ngModelChange)="onQuery($event)"
        />
      </xui-input-group>

      <xui-select
        class="w-44"
        aria-label="Filter by status"
        [items]="statuses"
        [filterable]="false"
        [value]="status()"
        (valueChange)="onStatus($event)"
      />

      <xui-select
        class="w-44"
        aria-label="Filter by plan"
        [items]="plans"
        [filterable]="false"
        [value]="plan()"
        (valueChange)="onPlan($event)"
      />

      @if (filtered().length !== data.customers().length) {
        <button xuiButton variant="ghost" size="sm" type="button" (click)="clearFilters()">Clear</button>
      }
    </div>

    @if (data.loading()) {
      <xui-skeleton class="h-96 w-full" />
    } @else if (filtered().length === 0) {
      <xui-non-ideal-state
        class="py-16"
        title="No customers match"
        description="Try a shorter search, or clear the status and plan filters."
      >
        <button xuiButton variant="outline" type="button" (click)="clearFilters()">Clear filters</button>
      </xui-non-ideal-state>
    } @else {
      <xui-table bordered interactive class="w-full">
        <xui-tr>
          <xui-th class="min-w-0 flex-1">
            <button type="button" class="flex items-center gap-1" (click)="sortBy('name')">
              Customer
              <ng-icon xui size="sm" [name]="sortIcon('name')" [class.invisible]="sort() !== 'name'" />
            </button>
          </xui-th>
          <xui-th class="hidden w-44 shrink-0 md:flex">
            <button type="button" class="flex items-center gap-1" (click)="sortBy('company')">
              Company
              <ng-icon xui size="sm" [name]="sortIcon('company')" [class.invisible]="sort() !== 'company'" />
            </button>
          </xui-th>
          <xui-th class="hidden w-28 shrink-0 lg:flex">Plan</xui-th>
          <xui-th class="w-28 shrink-0">Status</xui-th>
          <xui-th class="hidden w-20 shrink-0 justify-end sm:flex">
            <button type="button" class="flex items-center gap-1" (click)="sortBy('orders')">
              Orders
              <ng-icon xui size="sm" [name]="sortIcon('orders')" [class.invisible]="sort() !== 'orders'" />
            </button>
          </xui-th>
          <xui-th class="w-24 shrink-0 justify-end">
            <button type="button" class="flex items-center gap-1" (click)="sortBy('spend')">
              Spend
              <ng-icon xui size="sm" [name]="sortIcon('spend')" [class.invisible]="sort() !== 'spend'" />
            </button>
          </xui-th>
          <xui-th class="w-12 shrink-0"><span class="sr-only">Actions</span></xui-th>
        </xui-tr>

        @for (customer of page(); track customer.id) {
          <xui-tr>
            <xui-td class="min-w-0 flex-1">
              <button type="button" class="flex min-w-0 items-center gap-2.5 text-start" (click)="open(customer)">
                <xui-avatar size="sm" [text]="initials(customer)" />
                <span class="min-w-0">
                  <span class="block truncate text-sm font-medium">{{ customer.name }}</span>
                  <span class="text-foreground-subtle block truncate text-xs">{{ customer.email }}</span>
                </span>
              </button>
            </xui-td>
            <xui-td truncate class="hidden w-44 shrink-0 md:flex">{{ customer.company }}</xui-td>
            <xui-td class="hidden w-28 shrink-0 lg:flex">
              <xui-tag minimal [color]="customer.plan === 'Enterprise' ? 'primary' : 'none'">
                {{ customer.plan }}
              </xui-tag>
            </xui-td>
            <xui-td class="w-28 shrink-0">
              <xui-tag minimal [color]="statusColor(customer.status)">{{ customer.status }}</xui-tag>
            </xui-td>
            <xui-td class="hidden w-20 shrink-0 justify-end tabular-nums sm:flex">{{ customer.orders }}</xui-td>
            <xui-td class="w-24 shrink-0 justify-end tabular-nums">{{ asMoney(customer.spend) }}</xui-td>
            <xui-td class="w-12 shrink-0 justify-end">
              <button
                xuiButton
                variant="ghost"
                size="sm"
                type="button"
                [attr.aria-label]="'Actions for ' + customer.name"
                [xuiMenuTriggerFor]="rowMenu"
                (click)="active.set(customer)"
              >
                <ng-icon xui name="matMoreVertRound" />
              </button>
            </xui-td>
          </xui-tr>
        }
      </xui-table>

      <div class="mt-4 flex justify-end">
        <xui-pagination
          showSizeChanger
          showTotal
          [total]="filtered().length"
          [pageIndex]="pageIndex()"
          (pageIndexChange)="pageIndex.set($event)"
          [pageSize]="pageSize()"
          (pageSizeChange)="onPageSize($event)"
          [pageSizeOptions]="[10, 25, 50]"
        />
      </div>
    }

    <ng-template #rowMenu>
      <xui-menu>
        <button xuiMenuItem icon="matPersonRound" (click)="openActive()">View details</button>
        <button xuiMenuItem icon="matMailRound" (click)="notify('An invitation is on its way.')">Resend invite</button>
        <button xuiMenuItem icon="matBlockRound" (click)="toggleSuspended()">
          {{ active()?.status === 'suspended' ? 'Reinstate' : 'Suspend' }}
        </button>
        <xui-menu-divider />
        <button xuiMenuItem icon="matDeleteRound" color="error" (click)="confirmDelete.set(true)">Delete</button>
      </xui-menu>
    </ng-template>

    <app-customer-detail-drawer
      [customer]="active()"
      [open]="detailOpen()"
      (openChange)="onDetailOpen($event)"
      (saveNote)="saveNote($event)"
    />

    <app-customer-invite-dialog [(open)]="inviteOpen" (invite)="invite($event)" />

    <app-customer-delete-dialog [customer]="active()" [(open)]="confirmDelete" (confirmed)="remove()" />
  `
})
export class Customers {
  /** Bound from the `id` query parameter, which is how the command palette links to one customer. */
  readonly id = input<string>();

  protected readonly data = inject(DataStore);

  private readonly toaster = inject(XuiToastService);
  private readonly router = inject(Router);

  protected readonly statuses = [ALL, 'active', 'invited', 'suspended'];
  protected readonly plans = [ALL, 'Free', 'Starter', 'Growth', 'Enterprise'];

  protected readonly query = signal('');
  protected readonly status = signal<string>(ALL);
  protected readonly plan = signal<string>(ALL);
  protected readonly sort = signal<SortKey>('spend');
  protected readonly descending = signal(true);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);

  protected readonly active = signal<Customer | null>(null);
  protected readonly detailOpen = signal(false);
  protected readonly confirmDelete = signal(false);
  protected readonly inviteOpen = signal(false);

  protected readonly filtered = computed(() => {
    const query = this.query().trim().toLowerCase();
    const status = this.status();
    const plan = this.plan();
    const key = this.sort();
    const direction = this.descending() ? -1 : 1;

    const matches = this.data.customers().filter(customer => {
      if (status !== ALL && customer.status !== status) {
        return false;
      }

      if (plan !== ALL && customer.plan !== plan) {
        return false;
      }

      return (
        !query ||
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.company.toLowerCase().includes(query)
      );
    });

    return [...matches].sort((a, b) => {
      const left = a[key];
      const right = b[key];

      if (typeof left === 'number' && typeof right === 'number') {
        return (left - right) * direction;
      }

      return String(left).localeCompare(String(right)) * direction;
    });
  });

  protected readonly page = computed(() => {
    const start = this.pageIndex() * this.pageSize();

    return this.filtered().slice(start, start + this.pageSize());
  });

  protected readonly summary = computed(() => {
    const total = this.data.customers().length;
    const shown = this.filtered().length;

    return shown === total
      ? `${total} accounts. Sort by any column; the filters stack.`
      : `${shown} of ${total} accounts match the current filters.`;
  });

  constructor() {
    effect(() => {
      const id = this.id();
      const customer = id ? this.data.customer(id) : undefined;

      if (customer) {
        this.open(customer);
      }
    });
  }

  protected onQuery(value: string): void {
    this.query.set(value);
    this.pageIndex.set(0);
  }

  protected onStatus(value: string | null): void {
    this.status.set(value ?? ALL);
    this.pageIndex.set(0);
  }

  protected onPlan(value: string | null): void {
    this.plan.set(value ?? ALL);
    this.pageIndex.set(0);
  }

  protected onPageSize(size: number): void {
    this.pageSize.set(size);
    this.pageIndex.set(0);
  }

  protected clearFilters(): void {
    this.query.set('');
    this.status.set(ALL);
    this.plan.set(ALL);
    this.pageIndex.set(0);
  }

  /** Clicking the active column flips the direction; a new column starts descending. */
  protected sortBy(key: SortKey): void {
    if (this.sort() === key) {
      this.descending.update(value => !value);
    } else {
      this.sort.set(key);
      this.descending.set(true);
    }

    this.pageIndex.set(0);
  }

  protected sortIcon(key: SortKey): string {
    return this.sort() === key && !this.descending() ? 'matArrowUpwardRound' : 'matArrowDownwardRound';
  }

  protected statusColor(status: CustomerStatus): 'success' | 'warning' | 'error' {
    return statusColor(status);
  }

  protected initials(customer: Customer): string {
    return customerInitials(customer);
  }

  protected asMoney(value: number): string {
    return money(value);
  }

  protected open(customer: Customer): void {
    this.active.set(customer);
    this.detailOpen.set(true);
  }

  protected openActive(): void {
    const customer = this.active();

    if (customer) {
      this.open(customer);
    }
  }

  /**
   * Closing clears the `id` query parameter as well as the drawer — leaving it set would have the
   * effect above re-open the drawer at the next unrelated change.
   */
  protected onDetailOpen(open: boolean): void {
    this.detailOpen.set(open);

    if (!open && this.id()) {
      void this.router.navigate([], { queryParams: {} });
    }
  }

  protected saveNote(note: string): void {
    const customer = this.active();

    if (!customer) {
      return;
    }

    this.data.updateCustomer(customer.id, { notes: note });
    this.notify('Note saved.', 'success');
    this.onDetailOpen(false);
  }

  protected toggleSuspended(): void {
    const customer = this.active();

    if (!customer) {
      return;
    }

    const status: CustomerStatus = customer.status === 'suspended' ? 'active' : 'suspended';

    this.data.updateCustomer(customer.id, { status });
    this.notify(
      status === 'suspended' ? `${customer.name} is suspended.` : `${customer.name} is active again.`,
      status === 'suspended' ? 'warning' : 'success'
    );
  }

  protected remove(): void {
    const customer = this.active();

    if (!customer) {
      return;
    }

    const index = this.data.indexOfCustomer(customer.id);

    this.data.removeCustomer(customer.id);
    this.detailOpen.set(false);
    this.toaster.show({
      message: `${customer.name} deleted.`,
      color: 'success',
      actionText: 'Undo',
      timeout: 8000,
      onAction: () => this.data.restoreCustomer(customer, index)
    });
  }

  protected invite(email: string): void {
    const plan: Plan = 'Starter';

    this.data.restoreCustomer(
      {
        id: `cus_new_${this.data.customers().length + 1}`,
        name: email.split('@')[0].replace(/[._]/g, ' '),
        email,
        company: 'Pending',
        country: '—',
        plan,
        status: 'invited',
        spend: 0,
        orders: 0,
        joinedAt: new Date(),
        lastSeenAt: new Date(),
        notes: ''
      },
      0
    );

    this.notify(`Invitation sent to ${email}.`, 'success');
  }

  protected exportCsv(): void {
    this.notify(`${this.filtered().length} rows queued for export.`);
  }

  protected notify(message: string, color: 'none' | 'success' | 'warning' = 'none'): void {
    this.toaster.show({ message, color });
  }
}
