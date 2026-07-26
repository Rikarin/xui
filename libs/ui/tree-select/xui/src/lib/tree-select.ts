import { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  model,
  signal,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import { injectXDirection, uniqueId } from '@xui/core/a11y';
import { injectXOutsideClick } from '@xui/core/interactions';
import {
  collectExpandedIds,
  flattenVisibleTree,
  toggleExpandedId,
  treeKeyAction,
  type XTreeNode,
  type XTreeNodeId
} from '@xui/core/tree';
import type { ClassValue } from 'clsx';

/**
 * A node in the tree-select panel — the shared {@link XTreeNode} shape, keyed
 * by `value` instead of `id`.
 */
export interface XuiTreeSelectNode extends Omit<XTreeNode, 'id' | 'children' | 'data'> {
  /** The option value; doubles as the node's identity in the tree. */
  value: string;
  children?: XuiTreeSelectNode[];
}

/** The headless tree node backing a {@link XuiTreeSelectNode}. */
type PanelNode = XTreeNode<XuiTreeSelectNode>;

const toTreeNode = (node: XuiTreeSelectNode): PanelNode => ({
  id: node.value,
  label: node.label,
  isExpanded: node.isExpanded,
  hasCaret: node.hasCaret,
  disabled: node.disabled,
  children: node.children?.map(toTreeNode),
  data: node
});

/**
 * A select whose options are a tree. Single-select binds `value`; with
 * `multiple`, `value` is a string array shown as removable chips. Branches
 * expand/collapse; leaf (or any) nodes are selectable.
 *
 * The panel follows the APG tree keyboard contract from the trigger:
 * Up/Down move the active row, the inline-end/-start arrows (RTL-aware)
 * expand/collapse or step in/out, Home/End jump, Enter/Space select and
 * Escape closes.
 *
 * ```html
 * <xui-tree-select [nodes]="tree" [(value)]="picked" placeholder="Pick a node" />
 * ```
 */
@Component({
  selector: 'xui-tree-select',
  template: `
    <button
      type="button"
      role="combobox"
      aria-haspopup="tree"
      [class]="triggerClass()"
      [disabled]="disabled()"
      [attr.aria-expanded]="open()"
      [attr.aria-controls]="open() ? panelId : null"
      [attr.aria-activedescendant]="activeDescendant()"
      (click)="toggle()"
      (keydown)="onTriggerKeydown($event)"
    >
      @if (multiple()) {
        @if (selectedValues().length) {
          <span class="flex flex-wrap gap-1">
            @for (val of selectedValues(); track val) {
              <span
                class="bg-surface-inset text-foreground inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs"
              >
                {{ labelOf(val) }}
                <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
                <span class="hover:text-error cursor-pointer" (click)="removeChip(val, $event)">×</span>
              </span>
            }
          </span>
        } @else {
          <span class="text-foreground-muted">{{ placeholder() }}</span>
        }
      } @else {
        <span [class]="displayLabel() ? 'text-foreground' : 'text-foreground-muted'">{{
          displayLabel() || placeholder()
        }}</span>
      }
      <svg viewBox="0 0 24 24" class="text-foreground-muted ms-auto h-4 w-4 shrink-0" fill="none">
        <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    @if (open()) {
      <div [class]="panelClass()" role="tree" [id]="panelId">
        @for (row of rows(); track row.node.id; let i = $index) {
          <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
          <div
            role="treeitem"
            [id]="rowId(i)"
            [class]="rowClass(row.node)"
            [style.padding-inline-start.px]="8 + row.level * 16"
            [attr.aria-expanded]="row.expandable ? expanded().has(row.node.id) : null"
            [attr.aria-selected]="isSelected(row.node.data!.value)"
            [attr.aria-disabled]="row.node.disabled || null"
            [attr.aria-level]="row.level + 1"
            (click)="pick(row.node.data!)"
          >
            @if (row.expandable) {
              <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
              <span
                class="hover:text-foreground text-foreground-muted -ms-1 flex h-4 w-4 items-center justify-center"
                (click)="toggleExpand(row.node.id, $event)"
              >
                <svg viewBox="0 0 24 24" [class]="caretClass(expanded().has(row.node.id))" fill="none">
                  <path
                    d="M9 6l6 6-6 6"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            } @else {
              <span class="w-3"></span>
            }
            @if (multiple()) {
              <span [class]="checkboxClass(isSelected(row.node.data!.value))">
                @if (isSelected(row.node.data!.value)) {
                  <svg viewBox="0 0 24 24" class="h-3 w-3" fill="none">
                    <path
                      d="M20 6 9 17l-5-5"
                      stroke="currentColor"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                }
              </span>
            }
            <span class="truncate">{{ row.node.label }}</span>
          </div>
        }
      </div>
    }
  `,
  host: {
    '[class]': 'computedClass()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiTreeSelect {
  protected readonly direction = injectXDirection();
  protected readonly panelId = uniqueId('xui-tree-select-panel');

  readonly class = input<ClassValue>('');
  readonly nodes = input<XuiTreeSelectNode[]>([]);
  readonly value = model<string | string[] | null>(null);
  readonly multiple = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly placeholder = input<string>('Select');
  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  protected readonly open = signal(false);

  /** The shared headless tree, keyed by each node's `value`. */
  private readonly tree = computed<PanelNode[]>(() => this.nodes().map(toTreeNode));

  /** Expanded branch values; reseeded from `isExpanded` when the nodes change. */
  protected readonly expanded = linkedSignal<PanelNode[], Set<XTreeNodeId>>({
    source: this.tree,
    computation: nodes => collectExpandedIds(nodes)
  });

  /** The visible rows of the panel, flattened in visual order. */
  protected readonly rows = computed(() => flattenVisibleTree(this.tree(), this.expanded()));

  /** The keyboard-active row's value (the trigger keeps DOM focus). */
  protected readonly activeValue = signal<string | null>(null);

  protected readonly activeDescendant = computed(() => {
    if (!this.open()) {
      return null;
    }
    const index = this.rows().findIndex(row => row.node.id === this.activeValue());
    return index >= 0 ? this.rowId(index) : null;
  });

  private readonly byValue = computed(() => {
    const map = new Map<string, XuiTreeSelectNode>();
    const walk = (list: XuiTreeSelectNode[]): void => {
      for (const node of list) {
        map.set(node.value, node);
        if (node.children) {
          walk(node.children);
        }
      }
    };
    walk(this.nodes());
    return map;
  });

  protected readonly selectedValues = computed(() => {
    const value = this.value();
    return Array.isArray(value) ? value : value != null ? [value] : [];
  });

  /** The single-select label (empty in multiple mode or when unset). */
  protected readonly displayLabel = computed(() => {
    const value = this.value();
    return typeof value === 'string' && value ? this.labelOf(value) : '';
  });

  constructor() {
    // `click` (not the default `pointerdown`), so an outside press that starts a
    // drag does not dismiss the panel before the user commits to it.
    injectXOutsideClick(
      () => {
        if (this.open()) {
          this.open.set(false);
        }
      },
      { event: 'click' }
    );
  }

  protected rowId(index: number): string {
    return `${this.panelId}-row-${index}`;
  }

  protected labelOf(value: string | null): string {
    return (value != null && this.byValue().get(value)?.label) || '';
  }

  protected isSelected(value: string): boolean {
    return this.selectedValues().includes(value);
  }

  protected toggle(): void {
    if (this.disabled()) {
      return;
    }
    if (this.open()) {
      this.open.set(false);
    } else {
      this.openPanel();
    }
  }

  private openPanel(): void {
    this.open.set(true);
    // Land the active row on the (first) selected value, else the first row.
    const rows = this.rows();
    const selected = this.selectedValues();
    const active = rows.find(row => selected.includes(String(row.node.id))) ?? rows[0];
    this.activeValue.set(active ? String(active.node.id) : null);
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (this.disabled()) {
      return;
    }

    if (!this.open()) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.openPanel();
      }
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.open.set(false);
      return;
    }
    if (event.key === 'Tab') {
      this.open.set(false);
      return;
    }

    const rows = this.rows();
    const index = rows.findIndex(row => row.node.id === this.activeValue());
    const action = treeKeyAction(event.key, this.direction(), rows, index, this.expanded());

    if (!action) {
      return;
    }
    event.preventDefault();

    switch (action.kind) {
      case 'focus':
        this.activeValue.set(String(action.node.id));
        break;
      case 'expand':
      case 'collapse':
        this.expanded.update(set => toggleExpandedId(set, action.node.id));
        break;
      case 'select':
        this.pick(action.node.data!);
        break;
    }
  }

  protected toggleExpand(id: XTreeNodeId, event: Event): void {
    event.stopPropagation();
    this.expanded.update(set => toggleExpandedId(set, id));
  }

  protected pick(node: XuiTreeSelectNode): void {
    if (node.disabled) {
      return;
    }
    this.activeValue.set(node.value);
    if (this.multiple()) {
      const current = this.selectedValues();
      this.value.set(current.includes(node.value) ? current.filter(v => v !== node.value) : [...current, node.value]);
    } else {
      this.value.set(node.value);
      this.open.set(false);
    }
  }

  protected removeChip(value: string, event: Event): void {
    event.stopPropagation();
    this.value.set(this.selectedValues().filter(v => v !== value));
  }

  protected readonly computedClass = computed(() => xui('relative block', this.class()));
  protected readonly triggerClass = computed(() =>
    xui(
      'border-border bg-surface text-foreground flex min-h-(--control-height-md) w-full items-center gap-1 rounded-md border px-(--control-padding-md) py-1 text-sm outline-none focus-visible:border-primary disabled:opacity-50'
    )
  );
  protected readonly panelClass = computed(() =>
    xui(
      'border-border bg-surface-overlay absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-lg border p-1 shadow-lg'
    )
  );

  /**
   * The expand caret. It is drawn pointing right, so a collapsed node has to be
   * flipped in RTL to keep pointing "further in"; expanded always points down.
   */
  protected caretClass(expanded: boolean): string {
    return xui('h-3.5 w-3.5 transition-transform', expanded ? 'rotate-90' : this.direction() === 'rtl' && 'rotate-180');
  }

  protected rowClass(node: PanelNode): string {
    return xui(
      'flex cursor-pointer items-center gap-1.5 rounded px-1.5 py-1 text-sm select-none',
      node.disabled ? 'text-foreground-subtle cursor-not-allowed' : 'hover:bg-surface-inset',
      node.id === this.activeValue() && 'bg-surface-inset',
      !this.multiple() && this.isSelected(node.data!.value) && 'bg-primary/10 text-primary'
    );
  }

  protected checkboxClass(selected: boolean): string {
    return xui(
      'flex h-4 w-4 items-center justify-center rounded border',
      selected ? 'bg-primary border-primary text-primary-foreground' : 'border-border'
    );
  }
}
