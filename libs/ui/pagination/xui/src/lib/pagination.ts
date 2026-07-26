import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  numberAttribute,
  ViewEncapsulation
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matChevronLeftRound, matChevronRightRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import { XuiIcon } from '@xui/icon';
import type { ClassValue } from 'clsx';
import { injectXuiPaginationConfig } from './pagination.token';

/**
 * Page navigation for a paged collection. Two-way `pageIndex` (1-based) and
 * `pageSize`; `total` is the item count. Renders prev/next, numbered pages with
 * ellipses, an optional size changer and an item-count summary.
 *
 * ```html
 * <xui-pagination [total]="248" [(pageIndex)]="page" [(pageSize)]="size" showSizeChanger showTotal />
 * ```
 */
@Component({
  selector: 'xui-pagination',
  template: `
    @if (showTotal()) {
      <span class="text-foreground-muted me-1 text-sm">{{ totalLabel() }}</span>
    }

    <button
      type="button"
      [class]="stepClass()"
      [disabled]="disabled() || pageIndex() <= 1"
      (click)="go(pageIndex() - 1)"
      aria-label="Previous page"
    >
      <ng-icon xui size="sm" name="matChevronLeftRound" />
    </button>

    @if (simple()) {
      <span class="text-foreground px-2 text-sm tabular-nums">{{ pageIndex() }} / {{ totalPages() }}</span>
    } @else {
      @for (item of pages(); track $index) {
        @if (item === '...') {
          <span class="text-foreground-muted px-1 select-none">…</span>
        } @else {
          <button
            type="button"
            [class]="pageClass(item === pageIndex())"
            [attr.aria-current]="item === pageIndex() ? 'page' : null"
            [disabled]="disabled()"
            (click)="go(item)"
          >
            {{ item }}
          </button>
        }
      }
    }

    <button
      type="button"
      [class]="stepClass()"
      [disabled]="disabled() || pageIndex() >= totalPages()"
      (click)="go(pageIndex() + 1)"
      aria-label="Next page"
    >
      <ng-icon xui size="sm" name="matChevronRightRound" />
    </button>

    @if (showSizeChanger()) {
      <select
        [class]="selectClass()"
        [disabled]="disabled()"
        (change)="changeSize($any($event.target).value)"
        aria-label="Page size"
      >
        @for (option of pageSizeOptions(); track option) {
          <option [value]="option" [selected]="option === pageSize()">{{ option }} / page</option>
        }
      </select>
    }
  `,
  host: {
    '[class]': 'computedClass()',
    role: 'navigation',
    'aria-label': 'Pagination'
  },
  imports: [NgIcon, XuiIcon],
  viewProviders: [provideIcons({ matChevronLeftRound, matChevronRightRound })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiPagination {
  private readonly config = injectXuiPaginationConfig();

  readonly class = input<ClassValue>('');

  readonly total = input<number, NumberInput>(0, { transform: numberAttribute });
  readonly pageIndex = model<number>(1);
  readonly pageSize = model<number>(10);
  readonly pageSizeOptions = input<number[]>(this.config.pageSizeOptions);
  readonly showSizeChanger = input<boolean, BooleanInput>(this.config.showSizeChanger, {
    transform: booleanAttribute
  });
  readonly showTotal = input<boolean, BooleanInput>(this.config.showTotal, { transform: booleanAttribute });
  readonly simple = input<boolean, BooleanInput>(this.config.simple, { transform: booleanAttribute });
  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  /** Pages shown on each side of the current page. */
  readonly siblingCount = input<number, NumberInput>(this.config.siblingCount, { transform: numberAttribute });

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  protected readonly pages = computed(() => paginationRange(this.pageIndex(), this.totalPages(), this.siblingCount()));

  protected readonly totalLabel = computed(() => {
    const total = this.total();
    if (total === 0) {
      return '0 items';
    }
    const start = (this.pageIndex() - 1) * this.pageSize() + 1;
    const end = Math.min(this.pageIndex() * this.pageSize(), total);
    return `${start}-${end} of ${total} items`;
  });

  protected go(page: number): void {
    if (this.disabled()) {
      return;
    }
    const next = Math.max(1, Math.min(this.totalPages(), page));
    if (next !== this.pageIndex()) {
      this.pageIndex.set(next);
    }
  }

  protected changeSize(value: string): void {
    const size = Number(value);
    if (!Number.isFinite(size) || size <= 0) {
      return;
    }
    this.pageSize.set(size);
    // Keep the current page in range after the size changes.
    if (this.pageIndex() > this.totalPages()) {
      this.pageIndex.set(this.totalPages());
    }
  }

  protected readonly computedClass = computed(() => xui('inline-flex items-center gap-1', this.class()));
  protected readonly selectClass = computed(() =>
    xui(
      'border-border bg-surface text-foreground ms-2 h-(--control-height-md) rounded-md border px-(--control-padding-sm) text-sm'
    )
  );

  // A disabled button keeps its pointer events so the cursor can say it is unavailable —
  // `pointer-events-none` would leave the arrow unchanged, since the browser takes no cursor from
  // an element that receives no pointer events. The native `disabled` swallows the click, and the
  // handlers guard on top of it; the hover lift is scoped to `enabled:` so the button does not
  // light up on the way past.
  protected stepClass(): string {
    return xui(
      'border-border text-foreground enabled:hover:bg-surface-inset flex size-(--control-height-md) items-center justify-center rounded-md border disabled:cursor-not-allowed disabled:opacity-40'
    );
  }

  protected pageClass(active: boolean): string {
    return xui(
      'flex h-(--control-height-md) min-w-(--control-height-md) items-center justify-center rounded-md border px-(--control-padding-sm) text-sm tabular-nums disabled:cursor-not-allowed disabled:opacity-40',
      active
        ? 'border-primary bg-primary text-primary-foreground font-medium'
        : 'border-border text-foreground enabled:hover:bg-surface-inset'
    );
  }
}

const range = (start: number, end: number): number[] =>
  Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i);

/**
 * The page items to display: page numbers with `'...'` ellipsis markers where
 * the range is collapsed. `siblingCount` is how many pages flank the current one.
 */
export function paginationRange(current: number, totalPages: number, siblingCount = 1): (number | '...')[] {
  const totalShown = siblingCount * 2 + 5;
  if (totalPages <= totalShown) {
    return range(1, totalPages);
  }

  const leftSibling = Math.max(current - siblingCount, 1);
  const rightSibling = Math.min(current + siblingCount, totalPages);
  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < totalPages - 1;
  const edgeCount = 3 + 2 * siblingCount;

  if (!showLeftDots && showRightDots) {
    return [...range(1, edgeCount), '...', totalPages];
  }
  if (showLeftDots && !showRightDots) {
    return [1, '...', ...range(totalPages - edgeCount + 1, totalPages)];
  }
  return [1, '...', ...range(leftSibling, rightSibling), '...', totalPages];
}
