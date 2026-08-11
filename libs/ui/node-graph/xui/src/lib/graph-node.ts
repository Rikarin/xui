import type { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { isPlatformBrowser } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  DestroyRef,
  ElementRef,
  inject,
  input,
  model,
  numberAttribute,
  type OnInit,
  output,
  PLATFORM_ID,
  signal,
  untracked,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { XUI_GRAPH_NODE } from './graph-node.token';
import { XuiGraphPort } from './graph-port';
import { XuiNodeGraphStore } from './node-graph-store';
import type { XuiGraphNodeHandle, XuiGraphPoint, XuiGraphPortLayout, XuiGraphSize } from './node-graph.types';

export const graphNodeVariants = cva(
  'bg-surface-raised text-foreground absolute top-0 left-0 flex flex-col rounded-lg border select-none',
  {
    variants: {
      selected: {
        true: 'border-primary ring-primary/60 ring-2',
        false: 'border-border shadow-elevation-2'
      },
      locked: {
        true: 'cursor-default',
        false: ''
      },
      dimmed: {
        true: 'opacity-45',
        false: ''
      }
    },
    defaultVariants: { selected: false, locked: false, dimmed: false }
  }
);

export type XuiGraphNodeVariants = VariantProps<typeof graphNodeVariants>;

/**
 * A card on the canvas: a header, an optional body, and a set of ports.
 *
 * ```html
 * <xui-graph-node nodeId="osc" label="Oscillator" [(position)]="position" accent="var(--color-chart-4)">
 *   <xui-graph-port portId="freq" direction="input" dataType="float" label="Frequency" />
 *   <xui-graph-port portId="out" direction="output" dataType="signal" label="Out" />
 * </xui-graph-node>
 * ```
 *
 * The node is deliberately unopinionated about its body — projected content
 * renders below the ports, so the same component serves a shader node, a
 * two-terminal resistor and a form-like settings card. What it does own is the
 * geometry: its position drives every wire attached to it, and its border is
 * where connectors sit.
 *
 * `position` is a model, so `[(position)]` keeps the host's own state authoritative
 * — nothing is mutated behind the caller's back.
 */
@Component({
  selector: 'xui-graph-node',
  template: `
    <div
      data-xui-graph-node-header
      [class]="headerClass()"
      [style.border-top-color]="accent()"
      (dblclick)="onHeaderDoubleClick($event)"
    >
      @if (collapsible()) {
        <button
          type="button"
          class="text-foreground-subtle hover:text-foreground -ml-1 shrink-0 cursor-pointer p-0.5 leading-none"
          [attr.aria-label]="collapsed() ? 'Expand node' : 'Collapse node'"
          [attr.aria-expanded]="!collapsed()"
          (click)="collapsed.set(!collapsed())"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            aria-hidden="true"
            class="transition-transform duration-150"
            [style.transform]="collapsed() ? 'rotate(-90deg)' : null"
          >
            <path d="M1 3 L5 7 L9 3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </button>
      }

      <ng-content select="xui-graph-node-header" />

      @if (label()) {
        <span class="min-w-0 flex-1 truncate">{{ label() }}</span>
      }

      <ng-content select="xui-graph-node-actions" />
    </div>

    @if (!collapsed()) {
      <ng-content select="xui-graph-node-preview" />
    }

    <!--
      Deliberately not positioned: left/right connectors resolve their inset
      against this box (full node width, no horizontal padding), while top and
      bottom ports are absolute and must resolve against the node itself.
    -->
    <div [class]="portsClass()">
      <ng-content select="xui-graph-port" />
    </div>

    @if (!collapsed()) {
      <ng-content />
    }
  `,
  host: {
    '[class]': 'computedClass()',
    '[attr.data-xui-graph-node]': 'nodeId()',
    '[attr.aria-selected]': 'selectable() ? selected() : null',
    '[attr.role]': "selectable() ? 'option' : null",
    '[style.transform]': 'transform()',
    '[style.width.px]': 'width()',
    '[style.z-index]': 'selected() ? 2 : 1',
    '[style.cursor]': 'dragCursor()',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'onPointerUp($event)',
    '(pointercancel)': 'onPointerUp($event)'
  },
  providers: [{ provide: XUI_GRAPH_NODE, useExisting: XuiGraphNode }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiGraphNode implements XuiGraphNodeHandle, OnInit {
  private readonly store = inject(XuiNodeGraphStore);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly sizeState = signal<XuiGraphSize>({ width: 0, height: 0 });
  private readonly layoutEpochState = signal(0);
  private dragOrigin: { x: number; y: number } | null = null;

  /** Host element. Ports measure their connector offsets against this box. */
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /** Identifies the node to edges and to the selection. Must be stable and unique. */
  readonly nodeId = input.required<string>();

  /** Extra classes, merged into the component's own rather than replacing them. */
  readonly class = input<ClassValue>('');

  /** Top-left corner in graph space. Two-way bound so the host owns the value. */
  readonly position = model<XuiGraphPoint>({ x: 0, y: 0 });

  /** The node's caption, shown in its header. */
  readonly label = input<string>('');

  /** Fixed width in graph units. Leave unset to size to content. */
  readonly width = input<number | undefined, NumberInput>(undefined, {
    transform: value => (value == null || value === '' ? undefined : numberAttribute(value))
  });

  /**
   * Accent colour for the header's top rule — the usual way a node editor shows
   * which category a node belongs to. Any CSS colour; prefer a theme token.
   */
  readonly accent = input<string>();

  /**
   * Id of the `<xui-graph-group>` this node belongs to. Membership lives on the
   * node rather than in the frame, so a node never has to move in the template to
   * join or leave one.
   */
  readonly group = input<string>();

  /** Arrangement of the port rows. */
  readonly portLayout = input<XuiGraphPortLayout>('stacked');

  /**
   * Hides the body and pulls every connector onto the header, so a finished
   * subtree can be folded away without breaking its wiring.
   */
  readonly collapsed = model(false);

  /** Add a header toggle that folds the node's body away, leaving its ports and edges intact. */
  readonly collapsible = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /**
   * Let the node be selected. Also what gives it `role="option"` and `aria-selected`; an unselectable node has
   * neither.
   */
  readonly selectable = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

  /** Let the node be dragged. A locked node, or a locked graph, overrides this. */
  readonly draggable = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

  /** Pins the node in place while leaving it selectable. */
  readonly locked = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /** Restrict dragging to the header, as a window manager does. */
  readonly dragHandle = input<'node' | 'header'>('node');

  /** Renders the node faded — for a disabled branch or a bypassed effect. */
  readonly dimmed = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /** Double-click on the header. The usual gesture for entering a subgraph. */
  readonly activated = output<void>();

  /** Measured border-box size in graph units, from a ResizeObserver. */
  readonly size = this.sizeState.asReadonly();

  /** @internal Bumped on reflow so ports know to re-measure. */
  readonly layoutEpoch = this.layoutEpochState.asReadonly();

  /** @internal Ports in DOM order, for side-relative indexing. */
  readonly portSlots = contentChildren(XuiGraphPort);

  readonly selected = computed(() => this.store.isNodeSelected(this.nodeId()));

  protected readonly immovable = computed(() => this.locked() || !this.draggable() || this.store.settings().locked);

  protected readonly transform = computed(() => {
    const { x, y } = this.position();

    return `translate(${x}px, ${y}px)`;
  });

  protected readonly dragCursor = computed(() =>
    this.immovable() ? null : this.dragHandle() === 'header' ? null : 'grab'
  );

  protected readonly computedClass = computed(() =>
    xui(
      graphNodeVariants({ selected: this.selected(), locked: this.locked(), dimmed: this.dimmed() }),
      !this.width() && 'min-w-40',
      this.class()
    )
  );

  protected readonly headerClass = computed(() =>
    xui(
      'flex items-center gap-2 rounded-t-lg px-3 py-2 text-sm font-medium',
      // The accent is painted as a thicker top rule, so it survives a dark theme
      // and never fights the node's own surface colour for contrast.
      this.accent() ? 'border-t-3' : 'border-t-3 border-t-transparent',
      !this.collapsed() && 'border-border-muted border-b',
      this.immovable() || this.dragHandle() === 'node' ? '' : 'cursor-grab'
    )
  );

  protected readonly portsClass = computed(() =>
    xui(
      this.portLayout() === 'columns' ? 'grid grid-cols-2' : 'flex flex-col',
      // Collapsed ports are absolute, so the container takes no room on its own.
      !this.collapsed() && this.portSlots().length > 0 && 'py-1.5'
    )
  );

  constructor() {
    // No `ResizeObserver` exists on the server, and constructing one throws
    // rather than doing nothing, which would take the whole graph down with it.
    // A node keeps its 0×0 size there — the same "not measured yet" the store
    // starts every node at — and measures for real once the browser takes over.
    if (!this.isBrowser || typeof ResizeObserver === 'undefined') {
      inject(DestroyRef).onDestroy(() => this.store.unregisterNode(this));

      return;
    }

    const observer = new ResizeObserver(entries => {
      const box = entries[0]?.borderBoxSize?.[0];
      const width = box ? box.inlineSize : this.element.offsetWidth;
      const height = box ? box.blockSize : this.element.offsetHeight;
      const current = untracked(this.sizeState);

      if (Math.abs(current.width - width) > 0.5 || Math.abs(current.height - height) > 0.5) {
        this.sizeState.set({ width, height });
      }

      // Bump unconditionally: a reflow that leaves the node's own box unchanged
      // — a label swap, a row appearing and another disappearing — still moves
      // the ports inside it.
      this.layoutEpochState.update(epoch => epoch + 1);
    });

    observer.observe(this.element);

    inject(DestroyRef).onDestroy(() => {
      observer.disconnect();
      this.store.unregisterNode(this);
    });
  }

  ngOnInit(): void {
    this.store.registerNode(this);
  }

  /** @internal Called by the store while dragging a selection. */
  moveTo(point: XuiGraphPoint): void {
    this.position.set(point);
  }

  protected onPointerDown(event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }

    // A press anywhere on a node belongs to the node, never to the canvas — even
    // when it lands on a control and starts no drag at all.
    event.stopPropagation();

    const target = event.target as HTMLElement;

    if (this.selectable()) {
      const additive = event.shiftKey || event.ctrlKey || event.metaKey;

      if (additive || !this.store.isNodeSelected(this.nodeId())) {
        this.store.selectNode(this.nodeId(), additive);
      }
    }

    if (this.immovable() || target.closest(NON_DRAGGABLE)) {
      return;
    }

    if (this.dragHandle() === 'header' && !target.closest('[data-xui-graph-node-header]')) {
      return;
    }

    event.preventDefault();
    this.element.setPointerCapture(event.pointerId);
    this.dragOrigin = { x: event.clientX, y: event.clientY };
    this.store.beginNodeDrag(this.nodeId());
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.dragOrigin) {
      return;
    }

    const { zoom } = this.store.viewport();

    this.store.dragNodesBy({
      x: (event.clientX - this.dragOrigin.x) / zoom,
      y: (event.clientY - this.dragOrigin.y) / zoom
    });
  }

  protected onPointerUp(event: PointerEvent): void {
    if (!this.dragOrigin) {
      return;
    }

    this.dragOrigin = null;
    this.element.releasePointerCapture(event.pointerId);
    this.store.endNodeDrag();
  }

  protected onHeaderDoubleClick(event: MouseEvent): void {
    event.stopPropagation();
    this.activated.emit();
  }
}

/**
 * Descendants that own their own pointer gestures. Ports link, native controls
 * take input, and anything marked `xuiGraphNoDrag` opts out explicitly.
 */
const NON_DRAGGABLE =
  '[data-xui-graph-port], [data-xui-graph-no-drag], input, textarea, select, button, a, [contenteditable="true"]';
