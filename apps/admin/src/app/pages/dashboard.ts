import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { XuiButtonImports } from '@xui/button';
import { XuiCardImports } from '@xui/card';
import { XuiEChartImports } from '@xui/echarts';
import { XuiSkeletonImports } from '@xui/skeleton';
import { XuiTableImports } from '@xui/table';
import { XuiTagImports } from '@xui/tag';
import { XuiTextImports } from '@xui/text';
import { XuiTimelineImports } from '@xui/timeline';
import type { EChartsOption } from 'echarts';
import { DataStore } from '../core/data-store';
import { money, relativeTime } from '../core/format';
import { averageOrderValue, byChannel, daily, orderCount, refundRate, revenue, topCustomers } from '../core/metrics';
import type { Order, OrderStatus } from '../core/models';
import { PageHeader } from '../shell/page-header';
import { StatCard } from '../shell/stat-card';

const STATUS_INTENT: Record<OrderStatus, 'none' | 'primary' | 'success' | 'warning' | 'danger'> = {
  paid: 'success',
  shipped: 'primary',
  pending: 'warning',
  refunded: 'none',
  failed: 'danger'
};

/**
 * What happened in the last thirty days.
 *
 * Every figure is derived from the order list rather than stored: the cards, both charts and the
 * two side lists are all `computed()` over one signal, so there is no refresh path to get wrong.
 * The charts are handed plain ECharts options — `@xui/echarts` resolves the theme tokens itself and
 * re-reads them when the colour scheme changes, so nothing here knows what colour anything is.
 */
@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    XuiButtonImports,
    XuiCardImports,
    XuiEChartImports,
    XuiSkeletonImports,
    XuiTableImports,
    XuiTagImports,
    XuiTextImports,
    XuiTimelineImports,
    PageHeader,
    StatCard
  ],
  template: `
    <app-page-header title="Dashboard" description="Trading over the last 30 days, against the 30 before it.">
      <a xuiButton variant="outline" routerLink="/orders">All orders</a>
      <a xuiButton routerLink="/customers">Customers</a>
    </app-page-header>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <app-stat-card label="Revenue" [value]="stats().revenue" [change]="stats().revenueChange" [loading]="loading()" />
      <app-stat-card label="Orders" [value]="stats().orders" [change]="stats().ordersChange" [loading]="loading()" />
      <app-stat-card
        label="Average order"
        [value]="stats().average"
        [change]="stats().averageChange"
        [loading]="loading()"
      />
      <app-stat-card
        label="Refund rate"
        [value]="stats().refunds"
        [change]="stats().refundsChange"
        goodWhenDown
        [loading]="loading()"
      />
    </div>

    <!--
      Every grid item carries min-w-0. A grid track is min-content-sized by default, so one wide
      child — the orders table, whose columns are fixed-width and do not shrink — widens the track
      and pushes the whole page sideways on a phone.
    -->
    <div class="mt-4 grid gap-4 xl:grid-cols-3">
      <div xuiCard [elevation]="1" class="min-w-0 p-4 xl:col-span-2">
        <h2 xuiHeading [level]="3" class="mb-3 text-base">Revenue and orders</h2>
        @if (loading()) {
          <xui-skeleton class="h-64 w-full" />
        } @else {
          <xui-echart class="block h-64" ariaLabel="Daily revenue and order count" [option]="revenueChart()" />
        }
      </div>

      <div xuiCard [elevation]="1" class="min-w-0 p-4">
        <h2 xuiHeading [level]="3" class="mb-3 text-base">Revenue by channel</h2>
        @if (loading()) {
          <xui-skeleton class="h-64 w-full" />
        } @else {
          <xui-echart class="block h-64" ariaLabel="Revenue by sales channel" [option]="channelChart()" />
        }
      </div>
    </div>

    <div class="mt-4 grid gap-4 xl:grid-cols-3">
      <div xuiCard [elevation]="1" class="min-w-0 p-4 xl:col-span-2">
        <div class="mb-3 flex items-center justify-between gap-3">
          <h2 xuiHeading [level]="3" class="text-base">Latest orders</h2>
          <a xuiButton variant="ghost" size="sm" routerLink="/orders">View all</a>
        </div>

        @if (loading()) {
          <xui-skeleton class="h-48 w-full" />
        } @else {
          <xui-table bordered compact class="w-full">
            <xui-tr>
              <xui-th class="hidden w-28 shrink-0 sm:flex">Order</xui-th>
              <xui-th class="min-w-0 flex-1">Customer</xui-th>
              <xui-th class="w-24 shrink-0">Status</xui-th>
              <xui-th class="w-24 shrink-0 justify-end">Total</xui-th>
            </xui-tr>
            @for (order of latest(); track order.id) {
              <xui-tr>
                <xui-td class="hidden w-28 shrink-0 sm:flex">
                  <code class="font-mono text-xs">{{ order.reference }}</code>
                </xui-td>
                <xui-td truncate class="min-w-0 flex-1">{{ order.customerName }}</xui-td>
                <xui-td class="w-24 shrink-0">
                  <xui-tag minimal [intent]="statusIntent(order.status)">{{ order.status }}</xui-tag>
                </xui-td>
                <xui-td class="w-24 shrink-0 justify-end tabular-nums">{{ total(order) }}</xui-td>
              </xui-tr>
            }
          </xui-table>
        }
      </div>

      <div class="min-w-0 space-y-4">
        <div xuiCard [elevation]="1" class="p-4">
          <h2 xuiHeading [level]="3" class="mb-3 text-base">Top customers</h2>
          @if (loading()) {
            <xui-skeleton class="h-32 w-full" />
          } @else {
            <ul class="space-y-2.5">
              @for (entry of top(); track entry.name) {
                <li class="flex items-center gap-3">
                  <span class="min-w-0 flex-1 truncate text-sm">{{ entry.name }}</span>
                  <span class="shrink-0 text-sm font-medium tabular-nums">{{ asMoney(entry.total) }}</span>
                </li>
              }
            </ul>
          }
        </div>

        <div xuiCard [elevation]="1" class="p-4">
          <h2 xuiHeading [level]="3" class="mb-3 text-base">Activity</h2>
          @if (loading()) {
            <xui-skeleton class="h-40 w-full" />
          } @else {
            <xui-timeline>
              @for (entry of data.activity(); track entry.id) {
                <xui-timeline-item [color]="entry.intent" [label]="ago(entry.at)">
                  <span xuiText size="sm">
                    <span class="font-medium">{{ entry.actor }}</span>
                    {{ entry.action }}
                    <span class="text-foreground-muted">{{ entry.target }}</span>
                  </span>
                </xui-timeline-item>
              }
            </xui-timeline>
          }
        </div>
      </div>
    </div>
  `
})
export class Dashboard {
  protected readonly data = inject(DataStore);
  protected readonly loading = this.data.loading;

  protected readonly stats = computed(() => {
    const orders = this.data.orders();

    const revenueTrend = revenue(orders);
    const countTrend = orderCount(orders);
    const averageTrend = averageOrderValue(orders);
    const refundTrend = refundRate(orders);

    return {
      revenue: money(revenueTrend.value),
      revenueChange: revenueTrend.change,
      orders: countTrend.value.toLocaleString('en-GB'),
      ordersChange: countTrend.change,
      average: money(averageTrend.value, true),
      averageChange: averageTrend.change,
      refunds: `${refundTrend.value}%`,
      refundsChange: refundTrend.change
    };
  });

  protected readonly latest = computed(() => this.data.orders().slice(0, 8));
  protected readonly top = computed(() => topCustomers(this.data.orders()));

  protected readonly revenueChart = computed<EChartsOption>(() => {
    const points = daily(this.data.orders());

    return {
      grid: { left: 8, right: 8, top: 28, bottom: 4, containLabel: true },
      tooltip: { trigger: 'axis' },
      legend: { data: ['Revenue', 'Orders'], top: 0, itemHeight: 8, itemWidth: 12 },
      xAxis: { type: 'category', data: points.map(point => point.label), boundaryGap: false },
      yAxis: [
        { type: 'value', name: 'Revenue', splitNumber: 4 },
        { type: 'value', name: 'Orders', splitNumber: 4, splitLine: { show: false } }
      ],
      series: [
        {
          name: 'Revenue',
          type: 'line',
          smooth: true,
          showSymbol: false,
          areaStyle: { opacity: 0.15 },
          data: points.map(point => point.revenue)
        },
        {
          name: 'Orders',
          type: 'bar',
          yAxisIndex: 1,
          barMaxWidth: 14,
          data: points.map(point => point.orders)
        }
      ]
    };
  });

  protected readonly channelChart = computed<EChartsOption>(() => ({
    tooltip: { trigger: 'item', valueFormatter: value => money(Number(value)) },
    legend: { bottom: 0, itemHeight: 8, itemWidth: 12 },
    series: [
      {
        type: 'pie',
        radius: ['52%', '76%'],
        center: ['50%', '44%'],
        itemStyle: { borderWidth: 2 },
        label: { show: false },
        data: byChannel(this.data.orders())
      }
    ]
  }));

  protected statusIntent(status: OrderStatus): 'none' | 'primary' | 'success' | 'warning' | 'danger' {
    return STATUS_INTENT[status];
  }

  protected total(order: Order): string {
    return money(order.total, true);
  }

  protected asMoney(value: number): string {
    return money(value);
  }

  protected ago(date: Date): string {
    return relativeTime(date);
  }
}
