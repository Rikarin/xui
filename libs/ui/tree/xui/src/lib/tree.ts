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
import { XuiIcon } from '@xui/icon';
import type { ClassValue } from 'clsx';
import type { XuiTreeNode } from './tree.types';

interface FlatNode {
  node: XuiTreeNode;
  level: number;
  parentId: string | number | null;
  expandable: boolean;
}

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
          [style.paddingLeft.rem]="0.5 + level * 1.25"
          [attr.data-node-id]="node.id"
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
                [class]="'transition-transform ' + (isExpanded(node) ? 'rotate-90' : '')"
                (click)="toggle(node); $event.stopPropagation()"
              />
            }
          </span>

          @if (node.icon) {
            <ng-icon xui [name]="node.icon" size="sm" class="text-foreground-muted shrink-0" />
          }

          <span class="flex-1 truncate">{{ node.label }}</span>

          @if (node.secondaryLabel) {
            <span class="text-foreground-muted ml-2 shrink-0 text-xs">{{ node.secondaryLabel }}</span>
          }
        </div>

        @if (isExpandable(node) && isExpanded(node)) {
          <ul role="group" class="m-0 list-none p-0">
            @for (child of node.childNodes ?? []; track child.id) {
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

  readonly class = input<ClassValue>('');
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });

  readonly nodes = input<XuiTreeNode[]>([]);

  /** The selected node id. Two-way bindable with `[(selectedId)]`. */
  readonly selectedId = model<string | number | null>(null);

  readonly nodeClick = output<XuiTreeNode>();
  readonly nodeExpanded = output<XuiTreeNode>();
  readonly nodeCollapsed = output<XuiTreeNode>();

  private readonly expanded = signal(new Set<string | number>());
  protected readonly focusedId = signal<string | number | null>(null);

  protected readonly computedClass = computed(() => xui('block text-sm select-none', this.class()));

  /** Every node flattened in visual (depth-first) order, respecting expansion. */
  private readonly visible = computed<FlatNode[]>(() => {
    const out: FlatNode[] = [];
    const walk = (list: XuiTreeNode[], level: number, parentId: string | number | null) => {
      for (const node of list) {
        const expandable = this.isExpandable(node);
        out.push({ node, level, parentId, expandable });
        if (expandable && this.expanded().has(node.id)) {
          walk(node.childNodes ?? [], level + 1, node.id);
        }
      }
    };
    walk(this.nodes(), 0, null);
    return out;
  });

  constructor() {
    // Seed expansion from each node's `isExpanded` flag, and the initial focus.
    effect(() => {
      const nodes = this.nodes();
      untracked(() => {
        const set = new Set<string | number>();
        const seed = (list: XuiTreeNode[]) => {
          for (const n of list) {
            if (n.isExpanded) {
              set.add(n.id);
            }
            if (n.childNodes) {
              seed(n.childNodes);
            }
          }
        };
        seed(nodes);
        this.expanded.set(set);
        if (this.focusedId() == null && nodes.length) {
          this.focusedId.set(nodes[0].id);
        }
      });
    });
  }

  protected isExpandable(node: XuiTreeNode): boolean {
    return !!node.hasCaret || !!node.childNodes?.length;
  }

  protected isExpanded(node: XuiTreeNode): boolean {
    return this.expanded().has(node.id);
  }

  protected rowClass(node: XuiTreeNode): string {
    return xui(
      'flex items-center gap-1.5 rounded py-1 pr-2 transition-colors',
      node.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-surface-inset/60',
      'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus focus:outline-none',
      node.id === this.selectedId() && 'bg-primary/10 text-primary'
    );
  }

  protected toggle(node: XuiTreeNode): void {
    if (node.disabled || !this.isExpandable(node)) {
      return;
    }

    const set = new Set(this.expanded());
    if (set.has(node.id)) {
      set.delete(node.id);
      this.nodeCollapsed.emit(node);
    } else {
      set.add(node.id);
      this.nodeExpanded.emit(node);
    }
    this.expanded.set(set);
  }

  private expand(node: XuiTreeNode): void {
    if (!this.isExpanded(node)) {
      this.toggle(node);
    }
  }

  private collapse(node: XuiTreeNode): void {
    if (this.isExpanded(node)) {
      this.toggle(node);
    }
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

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusIndex(index + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusIndex(index - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (this.isExpandable(node) && !this.isExpanded(node)) {
          this.expand(node);
        } else if (this.isExpandable(node)) {
          this.focusIndex(index + 1); // step into the first child
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (this.isExpandable(node) && this.isExpanded(node)) {
          this.collapse(node);
        } else {
          // Step out to the parent.
          const parentId = flat[index]?.parentId;
          const parentIndex = flat.findIndex(f => f.node.id === parentId);
          if (parentIndex >= 0) {
            this.focusIndex(parentIndex);
          }
        }
        break;
      case 'Home':
        event.preventDefault();
        this.focusIndex(0);
        break;
      case 'End':
        event.preventDefault();
        this.focusIndex(flat.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.onRowClick(node);
        break;
      default:
        return;
    }
  }

  private focusIndex(index: number): void {
    const flat = this.visible();
    const target = flat[Math.max(0, Math.min(flat.length - 1, index))];
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
