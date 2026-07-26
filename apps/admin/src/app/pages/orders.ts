import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matDownloadRound, matSearchRound } from '@ng-icons/material-icons/round';
import { XuiButtonImports } from '@xui/button';
import { XuiCalloutImports } from '@xui/callout';
import { XuiCardImports } from '@xui/card';
import { XuiDataTableImports, type XuiDataColumn } from '@xui/data-table';
import { XuiIconImports } from '@xui/icon';
import { XuiInputImports } from '@xui/input';
import { XuiSegmentedControlImports, type XuiSegmentedOption } from '@xui/segmented-control';
import { XuiSkeletonImports } from '@xui/skeleton';
import { XuiTagImports } from '@xui/tag';
import { XuiTextImports } from '@xui/text';
import { XuiToastService } from '@xui/toast';
import { DataStore } from '../core/data-store';
import { money } from '../core/format';
import type { Order, OrderStatus } from '../core/models';
import { PageHeader } from '../shell/page-header';

const STATUS_COLOR: Record<OrderStatus, 'none' | 'primary' | 'success' | 'warning' | 'error'> = {
  paid: 'success',
  shipped: 'primary',
  pending: 'warning',
  refunded: 'none',
  failed: 'error'
};

const FILTERS: XuiSegmentedOption<string>[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'failed', label: 'Failed' }
];

/**
 * Five thousand orders in one scroll.
 *
 * This is the page the plain `xui-table` on the customers list would fall over on. `xui-data-table`
 * keeps only the visible rows in the DOM, so the filter box stays instant across the whole set —
 * and because it is a grid rather than a list, the columns resize, reorder and sort, and a range of
 * cells can be selected and copied out.
 *
 * The `[xuiDataCell]` template is what makes a virtualised grid still look like the rest of the
 * app: the status column renders a real `xui-tag` rather than the word "paid".
 */
@Component({
  selector: 'app-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    NgIcon,
    XuiButtonImports,
    XuiCalloutImports,
    XuiCardImports,
    XuiDataTableImports,
    XuiIconImports,
    XuiInputImports,
    XuiSegmentedControlImports,
    XuiSkeletonImports,
    XuiTagImports,
    XuiTextImports,
    PageHeader
  ],
  providers: [provideIcons({ matSearchRound, matDownloadRound })],
  template: `
    <app-page-header title="Orders" [description]="summary()">
      <button xuiButton variant="outline" type="button" (click)="exportCsv()">
        <ng-icon xui name="matDownloadRound" />
        Export
      </button>
    </app-page-header>

    <div class="mb-4 flex flex-wrap items-center gap-2">
      <xui-input-group class="w-full sm:w-72">
        <ng-icon xuiInputLeftElement xui name="matSearchRound" />
        <input
          xuiInput
          type="search"
          class="w-full"
          placeholder="Reference or customer…"
          aria-label="Search orders"
          [ngModel]="query()"
          (ngModelChange)="query.set($event)"
        />
      </xui-input-group>

      <!-- Six segments are wider than a phone; let the strip scroll rather than the page. -->
      <div class="max-w-full overflow-x-auto">
        <xui-segmented-control
          aria-label="Filter by status"
          [options]="filters"
          [value]="status()"
          (valueChange)="status.set($event ?? 'all')"
        />
      </div>
    </div>

    @if (data.loading()) {
      <xui-skeleton class="h-[32rem] w-full" />
    } @else {
      <div xuiCard [elevation]="1" class="overflow-hidden p-0">
        <xui-data-table
          showRowHeader
          [data]="rows()"
          [columns]="columns"
          [height]="520"
          [numFrozenColumns]="1"
          [rowHeight]="40"
        >
          <ng-template xuiDataCell let-value let-column="column">
            @if (column.id === 'status') {
              <xui-tag minimal [color]="statusColor(value)">{{ value }}</xui-tag>
            } @else {
              <span [class.font-mono]="column.id === 'reference'" [class.tabular-nums]="column.align === 'right'">
                {{ value }}
              </span>
            }
          </ng-template>
        </xui-data-table>
      </div>

      <xui-callout color="none" class="mt-4">
        <p xuiText size="sm">
          Every one of the {{ rowCount() }} matching orders is in this grid — only the rows you can see are in the DOM.
          Drag a header to reorder, drag its edge to resize, double-click the edge to fit, and shift-click or arrow-key
          across cells to select a range.
        </p>
      </xui-callout>
    }
  `
})
export class Orders {
  protected readonly data = inject(DataStore);

  private readonly toaster = inject(XuiToastService);

  protected readonly filters = FILTERS;
  protected readonly query = signal('');
  protected readonly status = signal('all');

  protected readonly columns: XuiDataColumn<Row>[] = [
    { id: 'reference', header: 'Reference', width: 130, sortable: true },
    { id: 'customerName', header: 'Customer', width: 190, sortable: true },
    { id: 'status', header: 'Status', width: 110, sortable: true },
    { id: 'channel', header: 'Channel', width: 110, sortable: true },
    { id: 'items', header: 'Items', width: 80, align: 'right', sortable: true },
    { id: 'total', header: 'Total', width: 110, align: 'right', sortable: true },
    { id: 'placed', header: 'Placed', width: 160, sortable: true }
  ];

  protected readonly rows = computed<Row[]>(() => {
    const query = this.query().trim().toLowerCase();
    const status = this.status();

    return this.data
      .orders()
      .filter(order => {
        if (status !== 'all' && order.status !== status) {
          return false;
        }

        return (
          !query || order.reference.toLowerCase().includes(query) || order.customerName.toLowerCase().includes(query)
        );
      })
      .map(toRow);
  });

  protected readonly rowCount = computed(() => this.rows().length.toLocaleString('en-GB'));

  protected readonly summary = computed(() =>
    this.data.loading()
      ? 'Loading…'
      : `${this.rowCount()} orders, virtualised. Sort, resize and reorder the columns; select a range and copy it.`
  );

  protected statusColor(value: unknown): 'none' | 'primary' | 'success' | 'warning' | 'error' {
    return STATUS_COLOR[value as OrderStatus] ?? 'none';
  }

  protected exportCsv(): void {
    this.toaster.show({ message: `${this.rowCount()} rows queued for export.` });
  }
}

/**
 * A row shaped for the grid: pre-formatted, because a cell renderer runs on every scroll frame and
 * a virtualised grid is the wrong place to be building `Intl` formatters.
 */
interface Row {
  reference: string;
  customerName: string;
  status: OrderStatus;
  channel: string;
  items: number;
  total: string;
  placed: string;
}

const PLACED = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

function toRow(order: Order): Row {
  return {
    reference: order.reference,
    customerName: order.customerName,
    status: order.status,
    channel: order.channel,
    items: order.items,
    total: money(order.total, true),
    placed: PLACED.format(order.placedAt)
  };
}
