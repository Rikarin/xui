import type { NumberInput } from '@angular/cdk/coercion';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  Directive,
  effect,
  input,
  numberAttribute,
  output,
  TemplateRef,
  untracked,
  ViewEncapsulation
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { xui } from '@xui/core';
import { XuiIcon } from '@xui/icon';
import { XuiMenu, XuiMenuItem, XuiMenuTrigger } from '@xui/menu';
import {
  XuiOverflowList,
  XuiOverflowListItem,
  XuiOverflowListOverflow,
  type XuiOverflowBoundary
} from '@xui/overflow-list';
import type { ClassValue } from 'clsx';
import { XuiBreadcrumb } from './breadcrumb';
import { XuiBreadcrumbEllipsis } from './breadcrumb-ellipsis';
import { XuiBreadcrumbItem } from './breadcrumb-item';
import { XuiBreadcrumbLink } from './breadcrumb-link';
import { XuiBreadcrumbPage } from './breadcrumb-page';
import { XuiBreadcrumbSeparator } from './breadcrumb-separator';

/** One crumb of a data-driven trail. */
export interface XuiBreadcrumbData {
  /** The label. */
  text?: string;

  /** Name of a registered `@ng-icons` icon, shown before the label. */
  icon?: string;

  /** Plain navigation. Mutually exclusive with `link`. */
  href?: string;

  /** Router navigation. Only this pulls `@angular/router` into the page. */
  link?: RouterLink['routerLink'];

  target?: string;

  /** Keeps the crumb in the trail but makes it unreachable. */
  disabled?: boolean;

  /** Forces the current crumb. Defaults to the last item. */
  current?: boolean;
}

/** Context handed to the crumb templates. */
export interface XuiBreadcrumbContext<T> {
  $implicit: T;
  index: number;
  current: boolean;
}

/** Context handed to the overflow template. */
export interface XuiBreadcrumbsOverflowContext<T> {
  $implicit: T[];
  count: number;
}

/** Replaces the default rendering of every crumb. */
@Directive({ selector: 'ng-template[xuiBreadcrumbsItem]', exportAs: 'xuiBreadcrumbsItem' })
export class XuiBreadcrumbsItem {}

/** Replaces the default rendering of the current crumb only. */
@Directive({ selector: 'ng-template[xuiBreadcrumbsCurrent]', exportAs: 'xuiBreadcrumbsCurrent' })
export class XuiBreadcrumbsCurrent {}

/** Replaces the ellipsis shown in place of the collapsed crumbs. */
@Directive({ selector: 'ng-template[xuiBreadcrumbsOverflow]', exportAs: 'xuiBreadcrumbsOverflow' })
export class XuiBreadcrumbsOverflow {}

/**
 * A breadcrumb trail built from an array, collapsing to fit.
 *
 * ```html
 * <xui-breadcrumbs [items]="crumbs()" (itemClick)="open($event)" />
 * <xui-breadcrumbs [items]="crumbs()" [maxItems]="4" />
 * ```
 *
 * This is the assembled form of the breadcrumb parts. Compose the parts directly
 * when the markup has to differ; reach for this when the trail is data.
 *
 * It collapses two ways, and they are alternatives rather than layers. By
 * default the trail is measured: crumbs that do not fit the container fold into
 * an ellipsis at the `collapseFrom` end. Set `maxItems` and it collapses by
 * count instead, dropping the **middle** — `itemsBeforeCollapse` crumbs of root,
 * `itemsAfterCollapse` crumbs of where you are, an ellipsis between them. A
 * six-level API path on a phone is the case that needs it: measuring would keep
 * the last crumb and hide the rest, and the answer a reader wants is the first
 * *and* the last.
 *
 * Either way the collapsed crumbs are not lost — they hang off the ellipsis as a
 * menu, they are handed to the overflow template, and `(overflow)` reports them.
 *
 * An `icon` names an `@ng-icons` icon that the application registers; this
 * package cannot know the set in advance.
 */
@Component({
  selector: 'xui-breadcrumbs',
  imports: [
    NgIcon,
    NgTemplateOutlet,
    RouterLink,
    XuiBreadcrumbEllipsis,
    XuiBreadcrumbItem,
    XuiBreadcrumbLink,
    XuiBreadcrumbPage,
    XuiBreadcrumbSeparator,
    XuiIcon,
    XuiMenu,
    XuiMenuItem,
    XuiMenuTrigger,
    XuiOverflowList,
    XuiOverflowListItem,
    XuiOverflowListOverflow
  ],
  hostDirectives: [{ directive: XuiBreadcrumb, inputs: ['aria-label'] }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (collapsedItems().length) {
      <!-- A real list, so the roles are the elements' own — unlike the measured
           branch, whose layout wrappers have to be told what they are. -->
      <ol class="text-foreground-muted flex min-w-0 items-center gap-1.5 text-sm">
        @for (entry of leadingItems(); track entry.index) {
          <ng-container *ngTemplateOutlet="crumbAt; context: { $implicit: entry.item, index: entry.index }" />
        }

        <li xuiBreadcrumbItem class="whitespace-nowrap">
          <span xuiBreadcrumbSeparator></span>
          <ng-container
            *ngTemplateOutlet="
              overflowTemplate() ?? defaultOverflow;
              context: { $implicit: collapsedItems(), count: collapsedItems().length }
            "
          />
        </li>

        @for (entry of trailingItems(); track entry.index) {
          <ng-container *ngTemplateOutlet="crumbAt; context: { $implicit: entry.item, index: entry.index }" />
        }
      </ol>
    } @else {
      <xui-overflow-list
        role="list"
        itemRole="listitem"
        class="text-foreground-muted gap-1.5 text-sm"
        [items]="items()"
        [collapseFrom]="collapseFrom()"
        [minVisibleItems]="minVisibleItems()"
        (overflowChange)="overflow.emit($event)"
      >
        <ng-template xuiOverflowListItem let-item let-index="index">
          <span xuiBreadcrumbItem class="whitespace-nowrap">
            @if (index > 0) {
              <span xuiBreadcrumbSeparator></span>
            }
            <ng-container
              *ngTemplateOutlet="
                isCurrent(index)
                  ? (currentTemplate() ?? itemTemplate() ?? defaultCurrent)
                  : (itemTemplate() ?? defaultCrumb);
                context: { $implicit: item, index: index, current: isCurrent(index) }
              "
            />
          </span>
        </ng-template>

        <ng-template xuiOverflowListOverflow let-hidden let-count="count">
          <span xuiBreadcrumbItem class="whitespace-nowrap">
            @if (collapseFrom() === 'end') {
              <span xuiBreadcrumbSeparator></span>
            }
            <ng-container
              *ngTemplateOutlet="overflowTemplate() ?? defaultOverflow; context: { $implicit: hidden, count: count }"
            />
          </span>
        </ng-template>
      </xui-overflow-list>
    }

    <!-- One crumb, separator and all — shared by the counted layout above and, through the
         overflow list's own item template, by the measured one. -->
    <ng-template #crumbAt let-item let-index="index">
      <li xuiBreadcrumbItem class="whitespace-nowrap">
        @if (index > 0) {
          <span xuiBreadcrumbSeparator></span>
        }
        <ng-container
          *ngTemplateOutlet="
            isCurrent(index)
              ? (currentTemplate() ?? itemTemplate() ?? defaultCurrent)
              : (itemTemplate() ?? defaultCrumb);
            context: { $implicit: item, index: index, current: isCurrent(index) }
          "
        />
      </li>
    </ng-template>

    <ng-template #defaultOverflow let-hidden>
      <button
        type="button"
        class="focus-visible:outline-focus rounded-sm focus-visible:outline-2"
        [attr.aria-label]="overflowLabel()"
        [xuiMenuTriggerFor]="overflowMenu"
      >
        <xui-breadcrumb-ellipsis />
      </button>

      <ng-template #overflowMenu>
        <xui-menu>
          @for (item of hidden; track $index) {
            @if (item.link) {
              <a
                xuiMenuItem
                [icon]="item.icon ?? null"
                [disabled]="item.disabled ?? false"
                [routerLink]="item.link"
                [attr.target]="item.target"
                (triggered)="itemClick.emit(item)"
                >{{ item.text }}</a
              >
            } @else if (item.href) {
              <a
                xuiMenuItem
                [icon]="item.icon ?? null"
                [disabled]="item.disabled ?? false"
                [href]="item.href"
                [attr.target]="item.target"
                (triggered)="itemClick.emit(item)"
                >{{ item.text }}</a
              >
            } @else {
              <button
                xuiMenuItem
                type="button"
                [icon]="item.icon ?? null"
                [disabled]="item.disabled ?? false"
                (triggered)="itemClick.emit(item)"
              >
                {{ item.text }}
              </button>
            }
          }
        </xui-menu>
      </ng-template>
    </ng-template>

    <ng-template #defaultCurrent let-item>
      <span xuiBreadcrumbPage class="inline-flex items-center gap-1.5">
        <ng-container *ngTemplateOutlet="crumbBody; context: { $implicit: item }" />
      </span>
    </ng-template>

    <ng-template #defaultCrumb let-item>
      @if (item.link) {
        <a
          xuiBreadcrumbLink
          class="inline-flex items-center gap-1.5"
          [routerLink]="item.link"
          [attr.target]="item.target"
          [disabled]="item.disabled"
          (click)="itemClick.emit(item)"
        >
          <ng-container *ngTemplateOutlet="crumbBody; context: { $implicit: item }" />
        </a>
      } @else if (item.href) {
        <a
          xuiBreadcrumbLink
          class="inline-flex items-center gap-1.5"
          [href]="item.href"
          [attr.target]="item.target"
          [disabled]="item.disabled"
          (click)="itemClick.emit(item)"
        >
          <ng-container *ngTemplateOutlet="crumbBody; context: { $implicit: item }" />
        </a>
      } @else {
        <span xuiBreadcrumbLink class="inline-flex items-center gap-1.5" [disabled]="item.disabled">
          <ng-container *ngTemplateOutlet="crumbBody; context: { $implicit: item }" />
        </span>
      }
    </ng-template>

    <ng-template #crumbBody let-item>
      @if (item.icon) {
        <ng-icon xui size="sm" class="shrink-0" [name]="item.icon" />
      }
      @if (item.text) {
        <span class="truncate">{{ item.text }}</span>
      }
    </ng-template>
  `,
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiBreadcrumbs<T extends XuiBreadcrumbData = XuiBreadcrumbData> {
  readonly itemTemplate = contentChild(XuiBreadcrumbsItem, { read: TemplateRef });
  readonly currentTemplate = contentChild(XuiBreadcrumbsCurrent, { read: TemplateRef });
  readonly overflowTemplate = contentChild(XuiBreadcrumbsOverflow, { read: TemplateRef });

  /** The user-defined classes. Merged last so they win over the base classes. */
  readonly class = input<ClassValue>('');
  /**
   * The trail, root first. Each entry renders through `XuiBreadcrumbData` unless a
   * `xuiBreadcrumbsItem` template overrides it; a wider `T` is passed through to that template
   * untouched, so extra fields survive the round trip to `itemClick`.
   */
  readonly items = input.required<readonly T[]>();

  /** Which end collapses when the trail is measured. A trail collapses from the start, keeping where you are. */
  readonly collapseFrom = input<XuiOverflowBoundary>('start');

  /** Never collapse below this many crumbs, however narrow the container gets. Measured collapse only. */
  readonly minVisibleItems = input<number, NumberInput>(0, { transform: numberAttribute });

  /**
   * Collapse the middle once the trail is longer than this many crumbs.
   *
   * `0` — the default — leaves collapsing to the measurement, which is the right
   * behaviour when the trail's width is the only thing at stake. A number takes
   * over completely: the trail no longer measures, so it renders the same on
   * every screen, which is what makes it worth setting.
   */
  readonly maxItems = input<number, NumberInput>(0, { transform: numberAttribute });

  /** How many crumbs stay at the root end when the middle collapses. */
  readonly itemsBeforeCollapse = input<number, NumberInput>(1, { transform: numberAttribute });

  /** How many crumbs stay at the current end when the middle collapses. */
  readonly itemsAfterCollapse = input<number, NumberInput>(1, { transform: numberAttribute });

  /** Accessible name of the button that opens the collapsed crumbs. */
  readonly overflowLabel = input<string>('Show the crumbs in between');

  /** Emits the collapsed crumbs whenever the set changes. */
  readonly overflow = output<T[]>();

  /** Emits when a navigable crumb is activated, from the trail or from the overflow menu. */
  readonly itemClick = output<T>();

  /**
   * Where the counted collapse cuts, as `[from, to)` into `items`.
   *
   * Empty unless `maxItems` is set *and* exceeded, and never so wide that it
   * would leave fewer crumbs than the two ends asked for — a `maxItems` smaller
   * than `itemsBeforeCollapse + itemsAfterCollapse` would otherwise hide crumbs
   * that were explicitly asked to stay.
   */
  private readonly collapseRange = computed<[number, number]>(() => {
    const total = this.items().length;
    const max = this.maxItems();

    if (max <= 0 || total <= max) {
      return [0, 0];
    }

    const before = Math.max(0, this.itemsBeforeCollapse());
    const after = Math.max(0, this.itemsAfterCollapse());

    if (before + after >= total) {
      return [0, 0];
    }

    return [before, total - after];
  });

  /** The crumbs before the ellipsis. */
  protected readonly leadingItems = computed(() => this.entriesIn(0, this.collapseRange()[0]));

  /** The crumbs after the ellipsis. */
  protected readonly trailingItems = computed(() => this.entriesIn(this.collapseRange()[1], this.items().length));

  /** The crumbs the ellipsis stands for. Empty while the trail is measured instead. */
  protected readonly collapsedItems = computed(() => {
    const [from, to] = this.collapseRange();

    return this.items().slice(from, to);
  });

  protected readonly computedClass = computed(() => xui('block min-w-0', this.class()));

  constructor() {
    // Report a counted collapse the same way the overflow list reports a
    // measured one, so a consumer listening to `(overflow)` never has to know
    // which of the two is running.
    let previous: readonly T[] = [];

    effect(() => {
      const collapsed = this.collapsedItems();

      untracked(() => {
        if (collapsed.length === previous.length && collapsed.every((item, index) => item === previous[index])) {
          return;
        }

        previous = collapsed;
        this.overflow.emit([...collapsed]);
      });
    });
  }

  /** The last crumb is where you are, unless an item says otherwise. */
  protected isCurrent(index: number): boolean {
    return this.items()[index]?.current ?? index === this.items().length - 1;
  }

  private entriesIn(from: number, to: number): { item: T; index: number }[] {
    return this.items()
      .slice(from, to)
      .map((item, offset) => ({ item, index: from + offset }));
  }
}
