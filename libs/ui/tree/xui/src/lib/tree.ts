import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  ViewEncapsulation
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matChevronRightRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import { injectXDirection } from '@xui/core/a11y';
import {
  collectExpandedIds,
  flattenTree,
  flattenVisibleTree,
  isTreeNodeExpandable,
  toggleExpandedId,
  treeKeyAction,
  type XFlatTreeNode
} from '@xui/core/tree';
import { XuiIcon } from '@xui/icon';
import type { ClassValue } from 'clsx';
import type { XuiTreeNode } from './tree.types';

/**
 * A hierarchical tree of {@link XuiTreeNode}s with expand/collapse carets, single
 * selection, optional icons and secondary labels, and full keyboard support
 * (Up/Down move, Right/Left expand/collapse or step in/out, Enter/Space select).
 */
@Component({
  selector: 'xui-tree',
  imports: [NgTemplateOutlet, NgIcon, XuiIcon],
  template: `
    <ng-template #nodeTpl let-node let-level="level">
      <li
        role="treeitem"
        [attr.aria-expanded]="isExpandable(node) ? isExpanded(node) : null"
        [attr.aria-selected]="node.id === selectedId()"
      >
        <div
          [class]="rowClass(node)"
          [style.padding-inline-start.rem]="0.5 + level * 1.25"
          [attr.data-node-id]="node.id"
          [attr.aria-current]="node.id === currentId() ? 'page' : null"
          [tabindex]="node.id === focusedId() ? 0 : -1"
          (click)="onRowClick(node)"
          (keydown)="onKeydown($event, node)"
        >
          <span class="flex size-5 shrink-0 items-center justify-center">
            @if (isExpandable(node)) {
              <ng-icon
                xui
                name="matChevronRightRound"
                size="sm"
                [class]="caretClass(isExpanded(node))"
                (click)="toggle(node); $event.stopPropagation()"
              />
            }
          </span>

          @if (node.icon) {
            <ng-icon xui [name]="node.icon" size="sm" class="text-foreground-muted shrink-0" />
          }

          <span class="flex-1 truncate">{{ node.label }}</span>

          @if (node.secondaryLabel) {
            <span class="text-foreground-muted ms-2 shrink-0 text-xs">{{ node.secondaryLabel }}</span>
          }
        </div>

        @if (isExpandable(node) && isExpanded(node)) {
          <ul role="group" class="m-0 list-none p-0">
            @for (child of node.children ?? []; track child.id) {
              <ng-container
                [ngTemplateOutlet]="nodeTpl"
                [ngTemplateOutletContext]="{ $implicit: child, level: level + 1 }"
              />
            }
          </ul>
        }
      </li>
    </ng-template>

    <ul role="tree" class="m-0 list-none p-0" [attr.aria-label]="ariaLabel()">
      @for (node of nodes(); track node.id) {
        <ng-container [ngTemplateOutlet]="nodeTpl" [ngTemplateOutletContext]="{ $implicit: node, level: 0 }" />
      }
    </ul>
  `,
  host: {
    '[class]': 'computedClass()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  viewProviders: [provideIcons({ matChevronRightRound })]
})
export class XuiTree {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly direction = injectXDirection();

  /** Extra classes, merged into the component's own rather than replacing them. */
  readonly class = input<ClassValue>('');
  /** Accessible name for the tree — what it is a tree of. */
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });

  /** The roots. Each node carries its own `children`, so the whole tree is one nested array. */
  readonly nodes = input<XuiTreeNode[]>([]);

  /** The selected node id. Two-way bindable with `[(selectedId)]`. */
  readonly selectedId = model<string | number | null>(null);

  /**
   * Ids of the expanded nodes. Two-way bindable with `[(expandedIds)]`, which is
   * how expansion survives something else rebuilding `nodes`.
   *
   * Seeded from each node's `isExpanded` the first time that node is seen, and
   * only then: a node the reader has since collapsed stays collapsed when the
   * array is rebuilt around it.
   */
  readonly expandedIds = model<readonly (string | number)[]>([]);

  /**
   * The node representing where the reader already is, marked `aria-current="page"`.
   *
   * Distinct from `selectedId` on purpose — selection is a state of the widget,
   * current is a fact about the document — though a navigation tree sets both to
   * the same node. A model rather than an input so `xuiTreeRouter` can write it
   * from the URL.
   */
  readonly currentId = model<string | number | null>(null);

  /** Emits the node that was activated, by click or by Enter. */
  readonly nodeClick = output<XuiTreeNode>();
  /** Emits the node that was just expanded. */
  readonly nodeExpanded = output<XuiTreeNode>();
  /** Emits the node that was just collapsed. */
  readonly nodeCollapsed = output<XuiTreeNode>();

  /** `expandedIds` as a set, which is what every lookup below wants. */
  private readonly expanded = computed(() => new Set(this.expandedIds()));

  /** Nodes whose `isExpanded` has already been honoured, so it is not re-applied. */
  private readonly seeded = new Set<string | number>();

  protected readonly focusedId = signal<string | number | null>(null);

  protected readonly computedClass = computed(() => xui('block text-sm select-none', this.class()));

  /** Every node flattened in visual (depth-first) order, respecting expansion. */
  private readonly visible = computed<XFlatTreeNode<XuiTreeNode>[]>(() =>
    flattenVisibleTree(this.nodes(), this.expanded())
  );

  constructor() {
    // Seed expansion from each node's `isExpanded` flag, and the initial focus.
    effect(() => {
      const nodes = this.nodes();

      untracked(() => {
        const flagged = collectExpandedIds(nodes);
        // Only nodes never seen before: re-applying the flag on every change to
        // `nodes` would reopen whatever the reader had just closed.
        const fresh = flattenTree(nodes)
          .filter(node => !this.seeded.has(node.id))
          .map(node => node.id)
          .filter(id => flagged.has(id));

        for (const node of flattenTree(nodes)) {
          this.seeded.add(node.id);
        }

        if (fresh.length) {
          this.expandedIds.update(ids => [...new Set([...ids, ...fresh])]);
        }

        if (this.focusedId() == null && nodes.length) {
          this.focusedId.set(nodes[0].id);
        }
      });
    });
  }

  /** Expand the given nodes, leaving whatever is already open alone. */
  expand(...ids: readonly (string | number)[]): void {
    const missing = ids.filter(id => !this.expanded().has(id));

    if (missing.length) {
      this.expandedIds.update(current => [...current, ...missing]);
    }
  }

  protected isExpandable(node: XuiTreeNode): boolean {
    return isTreeNodeExpandable(node);
  }

  protected isExpanded(node: XuiTreeNode): boolean {
    return this.expanded().has(node.id);
  }

  /**
   * The expand caret. It is drawn pointing right, so a collapsed node has to be
   * flipped in RTL to keep pointing "further in"; expanded always points down.
   */
  protected caretClass(expanded: boolean): string {
    return xui('transition-transform', expanded ? 'rotate-90' : this.direction() === 'rtl' && 'rotate-180');
  }

  protected rowClass(node: XuiTreeNode): string {
    return xui(
      'flex items-center gap-1.5 rounded py-1 pe-2 transition-colors',
      node.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-surface-inset/60',
      'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus',
      node.id === this.selectedId() && 'bg-primary/10 text-primary'
    );
  }

  protected toggle(node: XuiTreeNode): void {
    if (node.disabled || !this.isExpandable(node)) {
      return;
    }

    const wasExpanded = this.isExpanded(node);
    this.expandedIds.set([...toggleExpandedId(this.expanded(), node.id)]);
    (wasExpanded ? this.nodeCollapsed : this.nodeExpanded).emit(node);
  }

  protected onRowClick(node: XuiTreeNode): void {
    if (node.disabled) {
      return;
    }

    this.focusedId.set(node.id);
    this.selectedId.set(node.id);
    this.nodeClick.emit(node);
  }

  protected onKeydown(event: KeyboardEvent, node: XuiTreeNode): void {
    const flat = this.visible();
    const index = flat.findIndex(f => f.node.id === node.id);
    const action = treeKeyAction(event.key, this.direction(), flat, index, this.expanded());

    if (!action) {
      return;
    }
    event.preventDefault();

    switch (action.kind) {
      case 'expand':
      case 'collapse':
        this.toggle(action.node);
        break;
      case 'focus':
        this.focusIndex(action.index);
        break;
      case 'select':
        this.onRowClick(action.node);
        break;
    }
  }

  private focusIndex(index: number): void {
    const target = this.visible()[index];
    if (!target) {
      return;
    }

    this.focusedId.set(target.node.id);
    // Roving tabindex updates on the next tick; move DOM focus to the row.
    queueMicrotask(() => {
      this.host.nativeElement.querySelector<HTMLElement>(`[data-node-id="${target.node.id}"]`)?.focus();
    });
  }
}
