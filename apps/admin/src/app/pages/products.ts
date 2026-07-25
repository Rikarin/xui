import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matAddRound, matSearchRound, matWarningAmberRound } from '@ng-icons/material-icons/round';
import { XuiButtonImports } from '@xui/button';
import { XuiCalloutImports } from '@xui/callout';
import { XuiCardImports } from '@xui/card';
import { XuiEChartImports } from '@xui/echarts';
import { XuiIconImports } from '@xui/icon';
import { XuiInputImports } from '@xui/input';
import { XuiNonIdealStateImports } from '@xui/non-ideal-state';
import { XuiSkeletonImports } from '@xui/skeleton';
import { XuiTagImports } from '@xui/tag';
import { XuiTextImports } from '@xui/text';
import { XuiToastService } from '@xui/toast';
import type { EChartsOption } from 'echarts';
import { DataStore } from '../core/data-store';
import { money } from '../core/format';
import type { Product, StockStatus } from '../core/models';
import { PageHeader } from '../shell/page-header';

const STOCK: Record<StockStatus, { label: string; intent: 'success' | 'warning' | 'danger' }> = {
  'in-stock': { label: 'In stock', intent: 'success' },
  low: { label: 'Low', intent: 'warning' },
  out: { label: 'Out of stock', intent: 'danger' }
};

/**
 * The catalogue, as cards rather than rows.
 *
 * A grid earns its place here because each item carries a sparkline, and fourteen points of trend
 * are unreadable squeezed into a table cell. Each card is an interactive `xuiCard`, so hover and
 * focus are the library's rather than this page's.
 */
@Component({
  selector: 'app-products',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    NgIcon,
    XuiButtonImports,
    XuiCalloutImports,
    XuiCardImports,
    XuiEChartImports,
    XuiIconImports,
    XuiInputImports,
    XuiNonIdealStateImports,
    XuiSkeletonImports,
    XuiTagImports,
    XuiTextImports,
    PageHeader
  ],
  providers: [provideIcons({ matSearchRound, matAddRound, matWarningAmberRound })],
  template: `
    <app-page-header title="Products" description="Twenty-four lines, with the last fortnight of unit sales.">
      <button xuiButton type="button" (click)="notify('The product editor is out of scope for this example.')">
        <ng-icon xui name="matAddRound" />
        New product
      </button>
    </app-page-header>

    @if (needsRestock().length > 0) {
      <xui-callout color="warning" title="Stock needs attention" class="mb-4">
        <p xuiText size="sm">
          {{ restockMessage() }} Restocking one here updates the sidebar count as well — both read the same signal.
        </p>
      </xui-callout>
    }

    <div class="mb-4">
      <xui-input-group class="w-full sm:w-72">
        <ng-icon xuiInputLeftElement xui name="matSearchRound" />
        <input
          xuiInput
          type="search"
          class="w-full"
          placeholder="Search the catalogue…"
          aria-label="Search products"
          [ngModel]="query()"
          (ngModelChange)="query.set($event)"
        />
      </xui-input-group>
    </div>

    @if (data.loading()) {
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        @for (placeholder of [1, 2, 3, 4, 5, 6]; track placeholder) {
          <xui-skeleton class="h-44 w-full" />
        }
      </div>
    } @else if (visible().length === 0) {
      <xui-non-ideal-state class="py-16" title="Nothing in the catalogue matches" description="Try a shorter search.">
        <button xuiButton variant="outline" type="button" (click)="query.set('')">Clear search</button>
      </xui-non-ideal-state>
    } @else {
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        @for (product of visible(); track product.id) {
          <div xuiCard interactive [elevation]="1" class="flex flex-col gap-3 p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="truncate font-medium">{{ product.name }}</p>
                <p xuiText size="xs" color="subtle" class="truncate font-mono">{{ product.sku }}</p>
              </div>
              <xui-tag minimal [intent]="stock(product).intent">{{ stock(product).label }}</xui-tag>
            </div>

            <xui-echart
              class="block h-14"
              [ariaLabel]="'Unit sales for ' + product.name"
              [option]="sparkline(product)"
            />

            <div class="flex items-end justify-between gap-3">
              <div>
                <p class="text-lg font-semibold tabular-nums">{{ asMoney(product.price) }}</p>
                <p xuiText size="xs" color="subtle">{{ product.category }} · {{ product.stock }} in stock</p>
              </div>
              <button xuiButton variant="outline" size="sm" type="button" (click)="restock(product)">Restock</button>
            </div>
          </div>
        }
      </div>
    }
  `
})
export class Products {
  protected readonly data = inject(DataStore);

  private readonly toaster = inject(XuiToastService);

  protected readonly query = signal('');

  protected readonly visible = computed(() => {
    const query = this.query().trim().toLowerCase();

    return this.data
      .products()
      .filter(
        product =>
          !query ||
          product.name.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
      );
  });

  protected readonly needsRestock = computed(() =>
    this.data.products().filter(product => product.stockStatus !== 'in-stock')
  );

  protected readonly restockMessage = computed(() => {
    const count = this.needsRestock().length;

    return count === 1 ? '1 line is low or out.' : `${count} lines are low or out.`;
  });

  protected stock(product: Product): { label: string; intent: 'success' | 'warning' | 'danger' } {
    return STOCK[product.stockStatus];
  }

  protected asMoney(value: number): string {
    return money(value, true);
  }

  /** Axes and grid stripped out — at 56px tall the shape is the only thing legible. */
  protected sparkline(product: Product): EChartsOption {
    return {
      grid: { left: 0, right: 0, top: 4, bottom: 0 },
      xAxis: { type: 'category', show: false, data: product.trend.map((_unused, index) => index) },
      yAxis: { type: 'value', show: false },
      tooltip: { trigger: 'axis', formatter: '{c} units' },
      series: [
        {
          type: 'line',
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 2 },
          areaStyle: { opacity: 0.18 },
          data: product.trend
        }
      ]
    };
  }

  protected restock(product: Product): void {
    this.data.updateProduct(product.id, { stock: product.stock + 120, stockStatus: 'in-stock' });
    this.notify(`${product.name} restocked to ${product.stock + 120}.`, 'success');
  }

  protected notify(message: string, intent: 'none' | 'success' = 'none'): void {
    this.toaster.show({ message, intent });
  }
}
