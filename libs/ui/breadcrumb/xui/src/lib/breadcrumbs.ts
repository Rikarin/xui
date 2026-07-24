import type { NumberInput } from '@angular/cdk/coercion';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  computed,
  contentChild,
  input,
  numberAttribute,
  output
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { xui } from '@xui/core';
import { XuiIcon } from '@xui/icon';
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
@Directive({ selector: 'ng-template[xuiBreadcrumbsItem]' })
export class XuiBreadcrumbsItem {}

/** Replaces the default rendering of the current crumb only. */
@Directive({ selector: 'ng-template[xuiBreadcrumbsCurrent]' })
export class XuiBreadcrumbsCurrent {}

/** Replaces the ellipsis shown in place of the collapsed crumbs. */
@Directive({ selector: 'ng-template[xuiBreadcrumbsOverflow]' })
export class XuiBreadcrumbsOverflow {}

/**
 * A breadcrumb trail built from an array, collapsing to fit its container.
 *
 * ```html
 * <xui-breadcrumbs [items]="crumbs()" (itemClick)="open($event)" />
 * ```
 *
 * This is the assembled form of the breadcrumb parts, wired to
 * `xui-overflow-list` so crumbs that do not fit fold into an ellipsis. Compose
 * the parts directly when the markup has to differ; reach for this when the
 * trail is data.
 *
 * The collapsed crumbs are handed to the overflow template, so a menu can be
 * hung off the ellipsis. Without one they are not lost — the template receives
 * them and `(overflow)` reports them.
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
    XuiOverflowList,
    XuiOverflowListItem,
    XuiOverflowListOverflow
  ],
  hostDirectives: [{ directive: XuiBreadcrumb, inputs: ['aria-label'] }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <xui-overflow-list
      role="list"
      itemRole="listitem"
      class="text-foreground-muted gap-1.5 text-sm"
      [items]="items()"
      [collapseFrom]="collapseFrom()"
      [minVisibleItems]="minVisibleItems()"
      (overflow)="overflow.emit($event)"
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

    <ng-template #defaultOverflow>
      <xui-breadcrumb-ellipsis />
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
  readonly items = input.required<readonly T[]>();

  /** Which end collapses. A trail collapses from the start, keeping where you are. */
  readonly collapseFrom = input<XuiOverflowBoundary>('start');

  /** Never collapse below this many crumbs, however narrow the container gets. */
  readonly minVisibleItems = input<number, NumberInput>(0, { transform: numberAttribute });

  /** Emits the collapsed crumbs whenever the set changes. */
  readonly overflow = output<T[]>();

  /** Emits when a navigable crumb is activated. A crumb with neither `href` nor `link` is not. */
  readonly itemClick = output<T>();

  protected readonly computedClass = computed(() => xui('block min-w-0', this.class()));

  /** The last crumb is where you are, unless an item says otherwise. */
  protected isCurrent(index: number): boolean {
    return this.items()[index]?.current ?? index === this.items().length - 1;
  }
}
