import type { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  TemplateRef,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  inject,
  input,
  numberAttribute,
  output,
  signal,
  untracked,
  viewChild
} from '@angular/core';
import { xui } from '@xui/core';
import { injectElementSize } from '@xui/core/interactions';
import type { ClassValue } from 'clsx';

/** Which end of the list collapses into the overflow. */
export type XuiOverflowBoundary = 'start' | 'end';

/** Context handed to the `xuiOverflowListItem` template. */
export interface XuiOverflowItemContext<T> {
  $implicit: T;
  index: number;
}

/** Context handed to the `xuiOverflowListOverflow` template. */
export interface XuiOverflowContext<T> {
  $implicit: T[];
  count: number;
}

/** Marks the template used to render each visible item. */
@Directive({ selector: 'ng-template[xuiOverflowListItem]' })
export class XuiOverflowListItem {}

/** Marks the template used to render the collapsed items. */
@Directive({ selector: 'ng-template[xuiOverflowListOverflow]' })
export class XuiOverflowListOverflow {}

/**
 * Renders as many items as fit on one line and hands the rest to an overflow
 * template.
 *
 * ```html
 * <xui-overflow-list [items]="crumbs()">
 *   <ng-template xuiOverflowListItem let-crumb>
 *     <a xuiLink [routerLink]="crumb.url">{{ crumb.label }}</a>
 *   </ng-template>
 *   <ng-template xuiOverflowListOverflow let-hidden let-count="count">
 *     <button xuiButton size="sm">+{{ count }}</button>
 *   </ng-template>
 * </xui-overflow-list>
 * ```
 *
 * This is the measurement primitive behind collapsing breadcrumbs and tab bars.
 * It works by rendering every item once, off-screen, to learn each one's width,
 * then deciding how many fit — a single measurement pass rather than the
 * render-measure-rerender loop that makes this component janky when done naively.
 */
@Component({
  selector: 'xui-overflow-list',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (collapseFrom() === 'start' && (overflowed().length > 0 || alwaysRenderOverflow())) {
      <div class="shrink-0" [attr.role]="itemRole()">
        <ng-container
          *ngTemplateOutlet="
            overflowTemplate() ?? null;
            context: { $implicit: overflowed(), count: overflowed().length }
          "
        />
      </div>
    }

    @for (entry of visible(); track entry.index) {
      <div class="shrink-0" [attr.role]="itemRole()">
        <ng-container
          *ngTemplateOutlet="itemTemplate() ?? null; context: { $implicit: entry.item, index: entry.index }"
        />
      </div>
    }

    @if (collapseFrom() === 'end' && (overflowed().length > 0 || alwaysRenderOverflow())) {
      <div class="shrink-0" [attr.role]="itemRole()">
        <ng-container
          *ngTemplateOutlet="
            overflowTemplate() ?? null;
            context: { $implicit: overflowed(), count: overflowed().length }
          "
        />
      </div>
    }

    <!-- Measurement pass: laid out but never painted or announced. -->
    <div #ruler aria-hidden="true" class="pointer-events-none invisible absolute flex" style="left: -9999px; top: 0">
      @for (item of items(); track $index) {
        <div class="shrink-0">
          <ng-container *ngTemplateOutlet="itemTemplate() ?? null; context: { $implicit: item, index: $index }" />
        </div>
      }
    </div>
  `,
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiOverflowList<T> {
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly hostSize = injectElementSize();
  private readonly ruler = viewChild.required<ElementRef<HTMLElement>>('ruler');

  /** How many items fit, recomputed whenever the container or the items change. */
  private readonly visibleCount = signal(Number.MAX_SAFE_INTEGER);

  readonly itemTemplate = contentChild(XuiOverflowListItem, { read: TemplateRef });
  readonly overflowTemplate = contentChild(XuiOverflowListOverflow, { read: TemplateRef });

  /** The user-defined classes. Merged last so they win over the base classes. */
  readonly class = input<ClassValue>('');
  readonly items = input.required<readonly T[]>();

  /** Which end collapses. Breadcrumbs collapse from the start, tab bars from the end. */
  readonly collapseFrom = input<XuiOverflowBoundary>('start');

  /** Never collapse below this many items, however narrow the container gets. */
  readonly minVisibleItems = input<number, NumberInput>(0, { transform: numberAttribute });

  /** Render the overflow template even when nothing is hidden. */
  readonly alwaysRenderOverflow = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /**
   * Role for the wrapper around each item, including the overflow one.
   *
   * The wrappers exist to hold the layout, so by default they are plain
   * elements. A list needs them announced: set `role="list"` on the host and
   * `itemRole="listitem"` here, and the wrappers stop breaking the chain
   * between the two.
   */
  readonly itemRole = input<string | null>(null);

  /** Emits the hidden items whenever the overflow set changes. */
  readonly overflowChange = output<T[]>();

  /** Items that did not fit, in their original order. */
  readonly overflowed = computed<T[]>(() => {
    const items = this.items();
    const count = Math.min(this.visibleCount(), items.length);

    return this.collapseFrom() === 'start' ? items.slice(0, items.length - count) : items.slice(count);
  });

  /** Items that fit, paired with their index in the original list. */
  protected readonly visible = computed(() => {
    const items = this.items();
    const count = Math.min(this.visibleCount(), items.length);
    const entries = items.map((item, index) => ({ item, index }));

    return this.collapseFrom() === 'start' ? entries.slice(entries.length - count) : entries.slice(0, count);
  });

  protected readonly computedClass = computed(() =>
    xui('relative flex min-w-0 items-center gap-1 overflow-hidden', this.class())
  );

  constructor() {
    effect(() => {
      // Re-measure when the container resizes or the item set changes.
      this.hostSize();
      this.items();

      this.measure();
    });

    let previous: T[] = [];

    effect(() => {
      const overflowed = this.overflowed();

      untracked(() => {
        // Resizing that does not change which items are hidden should stay
        // quiet — consumers use this to open and close a menu.
        if (overflowed.length === previous.length && overflowed.every((item, i) => item === previous[i])) {
          return;
        }

        previous = overflowed;
        this.overflowChange.emit(overflowed);
      });
    });
  }

  /**
   * Work out how many items fit.
   *
   * Widths come from the off-screen ruler, so this never depends on what is
   * currently rendered and cannot oscillate between two states.
   */
  private measure(): void {
    const widths = [...this.ruler().nativeElement.children].map(child => child.getBoundingClientRect().width);
    const available = this.host.clientWidth;

    if (available === 0 || widths.length === 0) {
      // Nothing measurable yet: the first pass runs before the ruler has laid
      // out, and a container inside a hidden parent reports zero width. Show
      // everything and wait for the resize observer to report a real size —
      // clamping to the measured count here would collapse the whole list and
      // never recover, because nothing else would change to trigger a re-measure.
      this.visibleCount.set(Number.MAX_SAFE_INTEGER);

      return;
    }

    // The overflow indicator needs room too, so reserve a slot for it up front
    // when anything is going to be hidden.
    const total = widths.reduce((sum, width) => sum + width, 0);

    if (total <= available) {
      this.visibleCount.set(widths.length);

      return;
    }

    const budget = available * 0.85;
    const ordered = this.collapseFrom() === 'start' ? [...widths].reverse() : widths;

    let used = 0;
    let count = 0;

    for (const width of ordered) {
      if (used + width > budget) {
        break;
      }

      used += width;
      count++;
    }

    this.visibleCount.set(Math.max(count, this.minVisibleItems()));
  }
}
