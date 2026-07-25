import type { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  numberAttribute,
  type OnInit,
  signal,
  untracked,
  viewChild,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';
import { XUI_GRAPH_NODE } from './graph-node.token';
import { XuiNodeGraphStore } from './node-graph-store';
import type {
  XuiGraphPoint,
  XuiGraphPortDirection,
  XuiGraphPortHandle,
  XuiGraphPortShape,
  XuiGraphPortSide
} from './node-graph.types';
import { xuiGraphPortKey } from './node-graph.types';

/** Side a port takes when the author states only its direction. */
const SIDE_FOR_DIRECTION: Record<XuiGraphPortDirection, XuiGraphPortSide> = {
  input: 'left',
  output: 'right',
  inout: 'right'
};

/**
 * A connector on a node, together with the row of content that belongs to it.
 *
 * ```html
 * <xui-graph-node nodeId="mul" label="Multiply" [(position)]="position">
 *   <xui-graph-port portId="a" direction="input" dataType="float" label="A" />
 *   <xui-graph-port portId="b" direction="input" dataType="float" label="B" />
 *   <xui-graph-port portId="out" direction="output" dataType="float" label="Result" />
 * </xui-graph-node>
 * ```
 *
 * The host element is the whole row, so anything projected into it — a numeric
 * input, a colour swatch, a dropdown — sits inline with the connector, the way a
 * shader or VFX editor lays out its sockets. The connector itself is pinned to
 * the node's border, because that is what a wire attaches to.
 *
 * A hollow connector has nothing attached to it; a filled one is wired up.
 */
@Component({
  selector: 'xui-graph-port',
  template: `
    <div
      #connector
      role="button"
      [class]="connectorClass()"
      [style.width.px]="connectorWidth()"
      [style.height.px]="connectorHeight()"
      [style.background]="connected() ? resolvedColor() : 'var(--color-surface)'"
      [style.border-color]="resolvedColor()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-disabled]="disabled() || null"
      [attr.title]="tooltip()"
      [attr.tabindex]="disabled() ? null : 0"
      (pointerdown)="onPointerDown($event)"
      (pointermove)="onPointerMove($event)"
      (pointerup)="onPointerUp($event)"
      (pointercancel)="onPointerUp($event)"
      (keydown)="onKeydown($event)"
    ></div>

    @if (label()) {
      <span class="truncate">{{ label() }}</span>
    }

    <ng-content />
  `,
  host: {
    '[class]': 'computedClass()',
    '[attr.data-xui-graph-port]': 'portId()',
    '[attr.data-xui-graph-port-node]': 'nodeId()',
    '[attr.data-side]': 'resolvedSide()',
    '[attr.data-link-state]': 'linkState()',
    '[style.order]': 'order()',
    '[style.grid-column]': 'gridColumn()',
    '[style.grid-row]': 'gridRow()',
    '[style.left.%]': 'railOffset()',
    '[style.opacity]': "linkState() === 'invalid' ? 0.35 : null"
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiGraphPort implements XuiGraphPortHandle, OnInit {
  private readonly store = inject(XuiNodeGraphStore);
  private readonly node = inject(XUI_GRAPH_NODE);
  private readonly document = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.ownerDocument;
  private readonly connectorRef = viewChild.required<ElementRef<HTMLElement>>('connector');
  private readonly offsetState = signal<XuiGraphPoint>({ x: 0, y: 0 });

  /**
   * Registry identity. Empty until `ngOnInit`, because a required input is not
   * readable during construction.
   */
  key = '';

  /** Unique within the owning node — the node id supplies the rest of the identity. */
  readonly portId = input.required<string>();

  readonly class = input<ClassValue>('');

  /**
   * Which way data flows. `inout` covers terminals that are neither source nor
   * sink — a component lead in a schematic, where either end of a wire may be
   * drawn first.
   */
  readonly direction = input<XuiGraphPortDirection>('input');

  readonly label = input<string>('');

  /**
   * The compatibility key. Two ports may only be wired together when their data
   * types match, and the type also picks the connector's colour — see
   * `provideXuiNodeGraphConfig({ portTypes })`. Leaving it unset makes the port a
   * wildcard that connects to anything.
   */
  readonly dataType = input<string>();

  /** Overrides the colour inherited from {@link dataType}. */
  readonly color = input<string>();

  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /**
   * Which node edge the connector sits on. Leave unset to take it from
   * {@link direction} — inputs on the left, outputs on the right.
   */
  readonly side = input<XuiGraphPortSide>();

  readonly shape = input<XuiGraphPortShape>();

  /**
   * How many wires may terminate here. Defaults to 1 for an input — the usual
   * rule that a value has exactly one producer — and unlimited for outputs and
   * `inout` terminals, which fan out freely.
   */
  readonly maxConnections = input<number, NumberInput>(NaN, { transform: value => numberAttribute(value, NaN) });

  readonly nodeId = this.node.nodeId;

  readonly resolvedSide = computed(() => this.side() ?? SIDE_FOR_DIRECTION[this.direction()]);

  readonly resolvedMaxConnections = computed(() => {
    const explicit = this.maxConnections();

    return Number.isNaN(explicit) ? (this.direction() === 'input' ? 1 : Infinity) : explicit;
  });

  /** Connector centre relative to the node's top-left corner, in graph units. */
  readonly offset = this.offsetState.asReadonly();

  readonly resolvedColor = computed(() => {
    const explicit = this.color();

    if (explicit) {
      return explicit;
    }

    const settings = this.store.settings();
    const type = this.dataType();

    return (type ? settings.portTypes[type]?.color : undefined) ?? settings.portColor;
  });

  protected readonly resolvedShape = computed(() => {
    const settings = this.store.settings();
    const type = this.dataType();

    return this.shape() ?? (type ? settings.portTypes[type]?.shape : undefined) ?? settings.portShape;
  });

  protected readonly horizontal = computed(() => this.resolvedSide() === 'left' || this.resolvedSide() === 'right');

  private readonly size = computed(() => this.store.settings().portSize);

  // A pin is a lead rather than a socket: stretched along the node's normal.
  protected readonly connectorWidth = computed(() =>
    this.resolvedShape() === 'pin' && this.horizontal() ? this.size() * 2 : this.size()
  );

  protected readonly connectorHeight = computed(() =>
    this.resolvedShape() === 'pin' && !this.horizontal() ? this.size() * 2 : this.size()
  );

  protected readonly connected = computed(() => this.store.connectionCount(this.key) > 0);
  protected readonly linkState = computed(() => this.store.linkState(this.key));

  /** Position among the ports sharing this side; drives rails and column rows. */
  private readonly indexOnSide = computed(() => {
    const side = this.resolvedSide();
    const index = this.node
      .portSlots()
      .filter(slot => slot.resolvedSide() === side)
      .findIndex(slot => slot.key === this.key);

    return Math.max(index, 0);
  });

  private readonly countOnSide = computed(
    () => this.node.portSlots().filter(slot => slot.resolvedSide() === this.resolvedSide()).length
  );

  /**
   * Top and bottom ports spread evenly along their edge instead of stacking,
   * because a schematic reads those terminals as a rail, not as a list.
   */
  protected readonly railOffset = computed(() =>
    this.horizontal() ? null : ((this.indexOnSide() + 1) / (this.countOnSide() + 1)) * 100
  );

  protected readonly order = computed(() =>
    this.node.portLayout() === 'stacked' && this.horizontal() ? (this.resolvedSide() === 'right' ? 0 : 1) : null
  );

  protected readonly gridColumn = computed(() =>
    this.node.portLayout() === 'columns' && this.horizontal() ? (this.resolvedSide() === 'left' ? 1 : 2) : null
  );

  protected readonly gridRow = computed(() =>
    this.node.portLayout() === 'columns' && this.horizontal() ? this.indexOnSide() + 1 : null
  );

  protected readonly tooltip = computed(() => {
    const type = this.dataType();
    const typeLabel = type ? (this.store.settings().portTypes[type]?.label ?? type) : '';

    return [this.label(), typeLabel && `(${typeLabel})`].filter(Boolean).join(' ') || null;
  });

  protected readonly ariaLabel = computed(() => {
    const role = this.direction() === 'output' ? 'Output' : this.direction() === 'input' ? 'Input' : 'Terminal';

    return `${role} ${this.label() || this.portId()}`;
  });

  protected readonly computedClass = computed(() =>
    xui(
      'relative flex min-h-7 items-center gap-2 text-xs leading-tight',
      this.horizontal() ? 'px-3' : 'absolute w-max -translate-x-1/2 flex-col gap-1',
      this.resolvedSide() === 'left' && 'justify-start text-left',
      this.resolvedSide() === 'right' && 'flex-row-reverse justify-start text-right',
      this.resolvedSide() === 'top' && 'top-0 -translate-y-full flex-col-reverse pb-1',
      this.resolvedSide() === 'bottom' && 'bottom-0 translate-y-full pt-1',
      // Collapsed: every connector converges on the node's midline and the row's
      // own content is hidden, leaving the wiring intact but the card folded.
      // `inset-x-0` resolves against the node, since the ports container is not
      // itself positioned.
      this.node.collapsed() &&
        this.horizontal() &&
        'absolute inset-x-0 top-1/2 min-h-0 -translate-y-1/2 px-0 [&>:not(:first-child)]:hidden',
      this.disabled() ? 'text-foreground-subtle' : 'text-foreground-muted',
      this.class()
    )
  );

  protected readonly connectorClass = computed(() => {
    const shape = this.resolvedShape();
    const state = this.linkState();

    return xui(
      'absolute box-border border-2 transition-transform duration-100',
      // Pinned to the node's border box. The ports container carries no
      // horizontal padding, so `left-0` really is the node's own edge.
      this.resolvedSide() === 'left' && 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2',
      this.resolvedSide() === 'right' && 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2',
      this.resolvedSide() === 'top' && 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
      this.resolvedSide() === 'bottom' && 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
      shape === 'circle' && 'rounded-full',
      shape === 'square' && 'rounded-xs',
      shape === 'diamond' && 'rounded-xs rotate-45',
      shape === 'triangle' && 'rounded-none border-0 [clip-path:polygon(0_0,100%_50%,0_100%)]',
      shape === 'pin' && 'rounded-full',
      this.disabled() ? 'cursor-not-allowed opacity-40' : 'cursor-crosshair hover:scale-125',
      state === 'valid' && 'scale-150',
      state === 'source' && 'ring-focus scale-125 ring-2 ring-offset-1',
      'focus-visible:ring-focus focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none'
    );
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.store.unregisterPort(this));

    // Re-measure whenever something that could move the connector changes. The
    // reads happen in the post-render read phase, so no layout is forced during
    // rendering.
    afterRenderEffect({
      read: () => {
        this.node.layoutEpoch();
        this.node.collapsed();
        this.node.portLayout();
        this.resolvedSide();
        this.connectorWidth();
        this.connectorHeight();
        this.indexOnSide();
        this.countOnSide();

        this.measure();
      }
    });
  }

  ngOnInit(): void {
    this.key = xuiGraphPortKey(untracked(this.nodeId), untracked(this.portId));
    this.store.registerPort(this);
  }

  private measure(): void {
    const nodeRect = this.node.element.getBoundingClientRect();
    const rect = this.connectorRef().nativeElement.getBoundingClientRect();

    // Rects are post-transform, so undo the canvas scale to land in graph units.
    const zoom = untracked(this.store.viewport).zoom || 1;
    const next = {
      x: (rect.left + rect.width / 2 - nodeRect.left) / zoom,
      y: (rect.top + rect.height / 2 - nodeRect.top) / zoom
    };
    const current = untracked(this.offsetState);

    if (Math.abs(current.x - next.x) > 0.01 || Math.abs(current.y - next.y) > 0.01) {
      this.offsetState.set(next);
    }
  }

  protected onPointerDown(event: PointerEvent): void {
    if (event.button !== 0 || this.disabled() || this.store.settings().locked) {
      return;
    }

    // Keep the node from reading this as the start of a move.
    event.stopPropagation();
    event.preventDefault();

    this.connectorRef().nativeElement.setPointerCapture(event.pointerId);
    this.store.beginLink(this, this.store.toGraphPoint(event.clientX, event.clientY));
  }

  protected onPointerMove(event: PointerEvent): void {
    const linking = this.store.linking();

    if (!linking || linking.fromKey !== this.key) {
      return;
    }

    this.store.moveLink(this.store.toGraphPoint(event.clientX, event.clientY));
    this.store.setLinkHover(this.portKeyAt(event.clientX, event.clientY));
  }

  protected onPointerUp(event: PointerEvent): void {
    const linking = this.store.linking();

    if (!linking || linking.fromKey !== this.key) {
      return;
    }

    this.connectorRef().nativeElement.releasePointerCapture(event.pointerId);
    this.store.endLink(this.portKeyAt(event.clientX, event.clientY));
  }

  /**
   * Keyboard equivalent of dragging a wire: commit on one port, move focus,
   * commit on the other. Without it the graph cannot be wired without a mouse.
   */
  protected onKeydown(event: KeyboardEvent): void {
    if (this.disabled() || this.store.settings().locked) {
      return;
    }

    const linking = this.store.linking();

    if (event.key === 'Escape' && linking) {
      event.preventDefault();
      this.store.endLink(null);
      return;
    }

    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();

    if (!linking) {
      this.store.beginLink(this, this.store.portPoint(this.key) ?? { x: 0, y: 0 });
    } else {
      this.store.endLink(linking.fromKey === this.key ? null : this.key);
    }
  }

  /**
   * Which port, if any, lies under a screen point. Used for drop targeting.
   *
   * The two halves of the identity are read back as separate attributes rather
   * than as one composite key, so the registry is free to key ports however it
   * likes without that encoding having to survive a DOM round-trip.
   */
  private portKeyAt(clientX: number, clientY: number): string | null {
    const host = this.document.elementFromPoint(clientX, clientY)?.closest('[data-xui-graph-port]');
    const portId = host?.getAttribute('data-xui-graph-port');
    const nodeId = host?.getAttribute('data-xui-graph-port-node');

    if (portId == null || nodeId == null) {
      return null;
    }

    const key = xuiGraphPortKey(nodeId, portId);

    return key === this.key ? null : key;
  }
}
