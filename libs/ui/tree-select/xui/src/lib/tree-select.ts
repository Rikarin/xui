import { BooleanInput } from '@angular/cdk/coercion';
import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  model,
  signal,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

export interface XuiTreeSelectNode {
  value: string;
  label: string;
  children?: XuiTreeSelectNode[];
  disabled?: boolean;
}

/**
 * A select whose options are a tree. Single-select binds `value`; with
 * `multiple`, `value` is a string array shown as removable chips. Branches
 * expand/collapse; leaf (or any) nodes are selectable.
 *
 * ```html
 * <xui-tree-select [nodes]="tree" [(value)]="picked" placeholder="Pick a node" />
 * ```
 */
@Component({
  selector: 'xui-tree-select',
  imports: [NgTemplateOutlet],
  template: `
    <button type="button" [class]="triggerClass()" [disabled]="disabled()" (click)="toggle()" [attr.aria-expanded]="open()">
      @if (multiple()) {
        @if (selectedValues().length) {
          <span class="flex flex-wrap gap-1">
            @for (val of selectedValues(); track val) {
              <span class="bg-surface-inset text-foreground inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs">
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
        <span [class]="displayLabel() ? 'text-foreground' : 'text-foreground-muted'">{{ displayLabel() || placeholder() }}</span>
      }
      <svg viewBox="0 0 24 24" class="text-foreground-muted ms-auto h-4 w-4 shrink-0" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
    </button>

    @if (open()) {
      <div [class]="panelClass()" role="tree">
        @for (node of nodes(); track node.value) {
          <ng-container [ngTemplateOutlet]="nodeTpl" [ngTemplateOutletContext]="{ $implicit: node, level: 0 }" />
        }
      </div>
    }

    <ng-template #nodeTpl let-node let-level="level">
      <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
      <div
        role="treeitem"
        [class]="rowClass(node)"
        [style.padding-left.px]="8 + level * 16"
        [attr.aria-selected]="isSelected(node.value)"
        (click)="pick(node)"
      >
        @if (node.children?.length) {
          <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
          <span class="hover:text-foreground text-foreground-muted -ms-1 flex h-4 w-4 items-center justify-center" (click)="toggleExpand(node.value, $event)">
            <svg viewBox="0 0 24 24" class="h-3.5 w-3.5 transition-transform" [style.transform]="expanded().has(node.value) ? 'rotate(90deg)' : ''" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </span>
        } @else {
          <span class="w-3"></span>
        }
        @if (multiple()) {
          <span [class]="checkboxClass(isSelected(node.value))">
            @if (isSelected(node.value)) {
              <svg viewBox="0 0 24 24" class="h-3 w-3" fill="none"><path d="M20 6 9 17l-5-5" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" /></svg>
            }
          </span>
        }
        <span class="truncate">{{ node.label }}</span>
      </div>
      @if (expanded().has(node.value)) {
        @for (child of node.children ?? []; track child.value) {
          <ng-container [ngTemplateOutlet]="nodeTpl" [ngTemplateOutletContext]="{ $implicit: child, level: level + 1 }" />
        }
      }
    </ng-template>
  `,
  host: {
    '[class]': 'computedClass()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiTreeSelect {
  private readonly el = inject(ElementRef).nativeElement as HTMLElement;
  private readonly document = this.el.ownerDocument;

  readonly class = input<ClassValue>('');
  readonly nodes = input<XuiTreeSelectNode[]>([]);
  readonly value = model<string | string[] | null>(null);
  readonly multiple = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly placeholder = input<string>('Select');
  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  protected readonly open = signal(false);
  protected readonly expanded = signal(new Set<string>());

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
    const onDocClick = (event: MouseEvent): void => {
      if (this.open() && !this.el.contains(event.target as Node)) {
        this.open.set(false);
      }
    };
    this.document.addEventListener('click', onDocClick, true);
    inject(DestroyRef).onDestroy(() => this.document.removeEventListener('click', onDocClick, true));
  }

  protected labelOf(value: string | null): string {
    return (value != null && this.byValue().get(value)?.label) || '';
  }

  protected isSelected(value: string): boolean {
    return this.selectedValues().includes(value);
  }

  protected toggle(): void {
    if (!this.disabled()) {
      this.open.update(open => !open);
    }
  }

  protected toggleExpand(value: string, event: Event): void {
    event.stopPropagation();
    this.expanded.update(set => {
      const next = new Set(set);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }

  protected pick(node: XuiTreeSelectNode): void {
    if (node.disabled) {
      return;
    }
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
      'border-border bg-surface text-foreground flex min-h-9 w-full items-center gap-1 rounded-md border px-2.5 py-1 text-sm outline-none focus-visible:border-primary disabled:opacity-50'
    )
  );
  protected readonly panelClass = computed(() =>
    xui('border-border bg-surface-overlay absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-lg border p-1 shadow-lg')
  );

  protected rowClass(node: XuiTreeSelectNode): string {
    return xui(
      'flex cursor-pointer items-center gap-1.5 rounded px-1.5 py-1 text-sm select-none',
      node.disabled ? 'text-foreground-subtle cursor-not-allowed' : 'hover:bg-surface-inset',
      !this.multiple() && this.isSelected(node.value) && 'bg-primary/10 text-primary'
    );
  }

  protected checkboxClass(selected: boolean): string {
    return xui(
      'flex h-4 w-4 items-center justify-center rounded border',
      selected ? 'bg-primary border-primary text-primary-foreground' : 'border-border'
    );
  }
}
