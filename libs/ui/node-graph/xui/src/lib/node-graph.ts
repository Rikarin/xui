import type { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { isPlatformBrowser } from '@angular/common';
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
  numberAttribute,
  output,
  PLATFORM_ID,
  signal,
  untracked,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';
import { XuiNodeGraphStore, type XuiGraphSettings } from './node-graph-store';
import { xuiGraphEdgeMidpoint, xuiGraphEdgePath, type XuiGraphRouteOptions } from './node-graph.routing';
import { injectXuiNodeGraphConfig, type XuiGraphPortType } from './node-graph.token';
import type {
  XuiGraphBackground,
  XuiGraphConnection,
  XuiGraphConnectionDrop,
  XuiGraphConnectionValidator,
  XuiGraphEdge,
  XuiGraphMarker,
  XuiGraphNodeMove,
  XuiGraphPoint,
  XuiGraphPortShape,
  XuiGraphRect,
  XuiGraphRouting,
  XuiGraphViewport
} from './node-graph.types';
import { xuiGraphPortKey } from './node-graph.types';

/** What the canvas is currently doing with the pointer. */
type Gesture = 'none' | 'pan' | 'marquee';

/** Everything the template needs to draw one wire. */
interface RenderedEdge {
  edge: XuiGraphEdge;
  d: string;
  color: string;
  width: number;
  selected: boolean;
  dashArray: string | null;
  animated: boolean;
  markerId: string | null;
  label: string | null;
  labelPosition: XuiGraphPoint;
}

let nextGraphId = 0;

/**
 * A pannable, zoomable canvas for node-based editors and schematics.
 *
 * ```html
 * <xui-node-graph class="h-[600px]" [edges]="edges()" routing="orthogonal" snapToGrid (connect)="add($event)">
 *   @for (node of nodes(); track node.id) {
 *     <xui-graph-node [nodeId]="node.id" [label]="node.label" [(position)]="node.position">
 *       <xui-graph-port portId="in" direction="input" />
 *       <xui-graph-port portId="out" direction="output" />
 *     </xui-graph-node>
 *   }
 * </xui-node-graph>
 * ```
 *
 * Nodes are ordinary projected content, so they keep Angular's template model —
 * `@for`, `@if`, your own components — instead of being described by a
 * configuration object. Edges are an input rather than content because a wire
 * has no content of its own: its whole geometry is derived from the two ports it
 * joins, which the graph already tracks.
 *
 * The graph never mutates `edges`. `connect` reports an approved connection and
 * the host decides what to add, which is what keeps undo/redo and persistence in
 * the host's hands.
 */
@Component({
  selector: 'xui-node-graph',
  template: `
    <div
      class="pointer-events-none absolute inset-0"
      [style.background-image]="backgroundImage()"
      [style.background-size]="backgroundSize()"
      [style.background-position]="backgroundPosition()"
    ></div>

    <div class="absolute top-0 left-0 origin-top-left" [style.transform]="canvasTransform()">
      <svg class="pointer-events-none absolute overflow-visible" width="1" height="1" aria-hidden="true">
        <defs>
          <marker
            [id]="arrowId"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="5"
            orient="auto-start-reverse"
            markerUnits="userSpaceOnUse"
          >
            <path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" />
          </marker>
          <marker
            [id]="arrowClosedId"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="5"
            orient="auto-start-reverse"
            markerUnits="userSpaceOnUse"
          >
            <path d="M 1 1 L 9 5 L 1 9 Z" fill="context-stroke" stroke="context-stroke" stroke-width="1" />
          </marker>
          <marker [id]="dotId" markerWidth="8" markerHeight="8" refX="4" refY="4" markerUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="3" fill="context-stroke" />
          </marker>
        </defs>

        @for (item of renderedEdges(); track item.edge.id) {
          <g class="pointer-events-auto">
            @if (item.selected) {
              <path
                [attr.d]="item.d"
                fill="none"
                stroke="var(--color-selection)"
                [attr.stroke-width]="item.width + 8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            }
            <path
              class="cursor-pointer"
              [attr.d]="item.d"
              fill="none"
              stroke="transparent"
              [attr.stroke-width]="Math.max(item.width * 4, 14)"
              [attr.pointer-events]="locked() ? 'none' : 'stroke'"
              (pointerdown)="onEdgePointerDown(item.edge, $event)"
            />
            <path
              [class]="item.animated ? 'xui-graph-edge-flow' : null"
              [attr.d]="item.d"
              fill="none"
              [attr.stroke]="item.color"
              [attr.stroke-width]="item.width"
              [attr.stroke-dasharray]="item.dashArray"
              stroke-linecap="round"
              stroke-linejoin="round"
              [attr.marker-end]="item.markerId"
              pointer-events="none"
            />
          </g>
        }

        @if (linkPreview(); as preview) {
          <path
            [attr.d]="preview.d"
            fill="none"
            [attr.stroke]="preview.color"
            [attr.stroke-width]="edgeWidth()"
            stroke-dasharray="6 5"
            stroke-linecap="round"
            pointer-events="none"
          />
        }
      </svg>

      <ng-content />

      @for (item of renderedEdges(); track item.edge.id) {
        @if (item.label) {
          <div
            class="bg-surface-overlay text-foreground-muted border-border-muted pointer-events-none absolute rounded border px-1.5 py-0.5 text-[10px] whitespace-nowrap"
            [style.left.px]="item.labelPosition.x"
            [style.top.px]="item.labelPosition.y"
            style="transform: translate(-50%, -50%)"
          >
            {{ item.label }}
          </div>
        }
      }
    </div>

    @if (marqueeRect(); as rect) {
      <div
        class="border-primary bg-primary/15 pointer-events-none absolute border"
        [style.left.px]="rect.x"
        [style.top.px]="rect.y"
        [style.width.px]="rect.width"
        [style.height.px]="rect.height"
      ></div>
    }

    <ng-content select="xui-graph-overlay, xui-graph-controls, xui-graph-minimap" />
  `,
  styles: `
    @keyframes xui-graph-edge-flow {
      to {
        stroke-dashoffset: -16;
      }
    }

    .xui-graph-edge-flow {
      stroke-dasharray: 8 8;
      animation: xui-graph-edge-flow 0.6s linear infinite;
    }

    @media (prefers-reduced-motion: reduce) {
      .xui-graph-edge-flow {
        animation: none;
      }
    }
  `,
  host: {
    '[class]': 'computedClass()',
    '[attr.tabindex]': '0',
    role: 'application',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'onPointerUp($event)',
    '(pointercancel)': 'onPointerUp($event)',
    '(wheel)': 'onWheel($event)',
    '(keydown)': 'onKeydown($event)',
    '(contextmenu)': 'onContextMenu($event)'
  },
  providers: [XuiNodeGraphStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiNodeGraph {
  private readonly config = injectXuiNodeGraphConfig();
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly uid = nextGraphId++;

  /** Pointer position where the current gesture began, in client coordinates. */
  private gestureOrigin: XuiGraphPoint = { x: 0, y: 0 };
  private gesture: Gesture = 'none';
  private gestureMoved = false;

  private readonly marqueeState = signal<XuiGraphRect | null>(null);

  /** The store for this canvas. Use it to drive the view from a host component. */
  readonly store = inject(XuiNodeGraphStore);

  /** Extra classes, merged into the component's own rather than replacing them. */
  readonly class = input<ClassValue>('');

  /** The wires to draw. Never mutated — see `connect`. */
  readonly edges = input<readonly XuiGraphEdge[]>([]);

  /** Pan and zoom. Two-way bindable, so a host can save and restore the view. */
  readonly viewport = model<XuiGraphViewport>({ x: 0, y: 0, zoom: 1 });

  /**
   * How edges are drawn between ports: curved (`bezier`), right-angled (`orthogonal`), rounded right angles
   * (`smoothstep`), or direct (`straight`).
   */
  readonly routing = input<XuiGraphRouting>(this.config.routing);
  /** The canvas pattern behind the graph, which scales with the zoom. */
  readonly background = input<XuiGraphBackground>(this.config.background);
  /** Default end marker on an edge. An edge may override it. */
  readonly marker = input<XuiGraphMarker>(this.config.marker);

  /** Spacing of the background pattern, and the step nodes snap to when `snapToGrid` is on. */
  readonly gridSize = input<number, NumberInput>(this.config.gridSize, { transform: numberAttribute });

  /**
   * Round node positions to `gridSize` as they are dragged. Holding Shift while nudging with the arrow keys does the
   * same.
   */
  readonly snapToGrid = input<boolean, BooleanInput>(this.config.snapToGrid, { transform: booleanAttribute });

  /** How far the canvas can zoom out, as a scale factor. */
  readonly minZoom = input<number, NumberInput>(this.config.minZoom, { transform: numberAttribute });
  /** How far the canvas can zoom in, as a scale factor. */
  readonly maxZoom = input<number, NumberInput>(this.config.maxZoom, { transform: numberAttribute });

  /** Default stroke width for edges, in graph units. An edge may override it. */
  readonly edgeWidth = input<number, NumberInput>(this.config.edgeWidth, { transform: numberAttribute });
  /** Default port glyph size, in graph units. */
  readonly portSize = input<number, NumberInput>(this.config.portSize, { transform: numberAttribute });
  /** Default port glyph. A port type, or the port itself, may override it. */
  readonly portShape = input<XuiGraphPortShape>(this.config.portShape);
  /** Default port colour. A port type, or the port itself, may override it. */
  readonly portColor = input<string>(this.config.portColor);

  /** Data-type registry: colour, glyph and label per `dataType`. */
  readonly portTypes = input<Record<string, XuiGraphPortType>>(this.config.portTypes);

  /** Let an edge run from a node back to itself. */
  readonly allowSelfConnection = input<boolean, BooleanInput>(this.config.allowSelfConnection, {
    transform: booleanAttribute
  });

  /**
   * Refuse a connection between ports whose declared types do not match. Off by default, which leaves validation to
   * the host.
   */
  readonly enforcePortTypes = input<boolean, BooleanInput>(this.config.enforcePortTypes, {
    transform: booleanAttribute
  });

  /** Last say on whether a connection may be made. Runs after the built-in rules. */
  readonly isValidConnection = input<XuiGraphConnectionValidator>();

  /** Read-only canvas: pan and zoom still work, editing does not. */
  readonly locked = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /** Dragging empty canvas pans. Turn it off to make dragging a marquee select instead. */
  readonly panOnDrag = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

  /**
   * `wheel` zooms on a bare wheel, as node editors do. `ctrl-wheel` reserves the
   * bare wheel for panning and zooms only with the modifier, as design tools do.
   */
  readonly zoomActivation = input<'wheel' | 'ctrl-wheel'>('wheel');

  /**
   * Zoom on wheel. Turn it off inside a scrolling page, where the wheel should scroll past the graph rather than into
   * it.
   */
  readonly zoomOnScroll = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

  /** A connection that passed every rule. The host decides whether to add it. */
  readonly connect = output<XuiGraphConnection>();

  /** A wire dropped on empty canvas — the hook for "drag out to create a node". */
  readonly connectionDrop = output<XuiGraphConnectionDrop>();

  /** Emits the edge that was clicked. */
  readonly edgeClick = output<XuiGraphEdge>();

  /** Fired once per drag, when the pointer is released. */
  readonly nodeMove = output<XuiGraphNodeMove>();

  /** Emits the selected node and edge ids whenever the selection changes. */
  readonly selectionChange = output<{ nodes: string[]; edges: string[] }>();

  /** Delete or Backspace over the canvas. The host performs the removal. */
  readonly deleteSelection = output<{ nodes: string[]; edges: string[] }>();

  /**
   * Emits a right-click on empty canvas, with the position in graph coordinates — the hook for a "new node here" menu.
   */
  readonly canvasContextMenu = output<{ event: MouseEvent; position: XuiGraphPoint }>();

  protected readonly Math = Math;
  protected readonly arrowId = `xui-graph-arrow-${this.uid}`;
  protected readonly arrowClosedId = `xui-graph-arrow-closed-${this.uid}`;
  protected readonly dotId = `xui-graph-dot-${this.uid}`;

  protected readonly marqueeRect = computed(() => {
    const rect = this.marqueeState();

    if (!rect) {
      return null;
    }

    const origin = this.store.toSurfacePoint(rect);
    const { zoom } = this.viewport();

    return { x: origin.x, y: origin.y, width: rect.width * zoom, height: rect.height * zoom };
  });

  private readonly settings = computed<XuiGraphSettings>(() => ({
    routing: this.routing(),
    gridSize: this.gridSize(),
    snapToGrid: this.snapToGrid(),
    minZoom: this.minZoom(),
    maxZoom: this.maxZoom(),
    stubLength: this.config.stubLength,
    cornerRadius: this.config.cornerRadius,
    curvature: this.config.curvature,
    edgeWidth: this.edgeWidth(),
    portSize: this.portSize(),
    portShape: this.portShape(),
    portColor: this.portColor(),
    portTypes: this.portTypes(),
    allowSelfConnection: this.allowSelfConnection(),
    enforcePortTypes: this.enforcePortTypes(),
    isValidConnection: this.isValidConnection(),
    locked: this.locked()
  }));

  private readonly routeOptions = computed<XuiGraphRouteOptions>(() => ({
    stubLength: this.config.stubLength,
    cornerRadius: this.config.cornerRadius,
    curvature: this.config.curvature
  }));

  protected readonly canvasTransform = computed(() => {
    const { x, y, zoom } = this.viewport();

    return `translate(${x}px, ${y}px) scale(${zoom})`;
  });

  protected readonly renderedEdges = computed<RenderedEdge[]>(() => {
    const routing = this.routing();
    const options = this.routeOptions();
    const defaultWidth = this.edgeWidth();
    const defaultMarker = this.marker();
    const selected = this.store.selectedEdges();
    const rendered: RenderedEdge[] = [];

    for (const edge of this.edges()) {
      const sourceKey = xuiGraphPortKey(edge.source.nodeId, edge.source.portId);
      const targetKey = xuiGraphPortKey(edge.target.nodeId, edge.target.portId);
      const sourcePort = this.store.port(sourceKey);
      const targetPort = this.store.port(targetKey);
      const sourcePoint = this.store.portPoint(sourceKey);
      const targetPoint = this.store.portPoint(targetKey);

      // An edge naming a port that has not rendered yet is skipped rather than
      // guessed at, so a lazily-created node never draws a wire to the origin.
      if (!sourcePort || !targetPort || !sourcePoint || !targetPoint) {
        continue;
      }

      const edgeRouting = edge.routing ?? routing;
      const sourceSide = sourcePort.resolvedSide();
      const targetSide = targetPort.resolvedSide();
      const markerType = edge.marker ?? defaultMarker;

      rendered.push({
        edge,
        d: xuiGraphEdgePath(sourcePoint, sourceSide, targetPoint, targetSide, edgeRouting, options),
        color: edge.color ?? sourcePort.resolvedColor(),
        width: edge.width ?? defaultWidth,
        selected: selected.has(edge.id),
        dashArray: edge.dashed && !edge.animated ? '5 5' : null,
        animated: !!edge.animated,
        markerId: this.markerUrl(markerType),
        label: edge.label ?? null,
        labelPosition: xuiGraphEdgeMidpoint(sourcePoint, sourceSide, targetPoint, targetSide, edgeRouting, options)
      });
    }

    return rendered;
  });

  /** The wire that follows the pointer while a connection is being drawn. */
  protected readonly linkPreview = computed(() => {
    const linking = this.store.linking();

    if (!linking) {
      return null;
    }

    const port = this.store.port(linking.fromKey);
    const from = this.store.portPoint(linking.fromKey);

    if (!port || !from) {
      return null;
    }

    // Land on whichever port is hovered, so the preview snaps before release.
    const hoverPoint = linking.hoverKey ? this.store.portPoint(linking.hoverKey) : null;
    const hoverSide = linking.hoverKey ? this.store.port(linking.hoverKey)?.resolvedSide() : undefined;
    const to = hoverPoint ?? linking.pointer;
    const toSide = hoverSide ?? OPPOSITE[port.resolvedSide()];
    const valid = linking.hoverKey ? this.store.linkState(linking.hoverKey) === 'valid' : true;

    return {
      d: xuiGraphEdgePath(from, port.resolvedSide(), to, toSide, this.routing(), this.routeOptions()),
      color: valid ? port.resolvedColor() : 'var(--color-error)'
    };
  });

  protected readonly backgroundImage = computed(() => {
    const background = this.background();
    const step = this.gridSize() * this.viewport().zoom;

    // Below a few pixels a rule turns into noise, so it is dropped entirely.
    if (background === 'none' || step < 4) {
      return null;
    }

    if (background === 'dots') {
      return 'radial-gradient(circle, var(--color-border-strong) 1px, transparent 1px)';
    }

    return [
      'linear-gradient(to right, var(--color-border-muted) 1px, transparent 1px)',
      'linear-gradient(to bottom, var(--color-border-muted) 1px, transparent 1px)',
      'linear-gradient(to right, var(--color-border) 1px, transparent 1px)',
      'linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)'
    ].join(', ');
  });

  protected readonly backgroundSize = computed(() => {
    const step = this.gridSize() * this.viewport().zoom;
    const major = step * this.config.gridMajorEvery;

    return this.background() === 'dots'
      ? `${step}px ${step}px`
      : `${step}px ${step}px, ${step}px ${step}px, ${major}px ${major}px, ${major}px ${major}px`;
  });

  protected readonly backgroundPosition = computed(() => {
    const { x, y } = this.viewport();
    const offset = `${x}px ${y}px`;

    return this.background() === 'dots' ? offset : `${offset}, ${offset}, ${offset}, ${offset}`;
  });

  protected readonly computedClass = computed(() =>
    xui(
      // The canvas is focusable so its shortcuts work, but draws no focus ring:
      // a ring around the whole editor reads as a selection the user did not make,
      // and every element inside it that can hold focus rings on its own.
      'bg-background relative block touch-none overflow-hidden outline-none',
      this.class()
    )
  );

  constructor() {
    this.store.configure({
      settings: this.settings,
      viewport: this.viewport,
      edges: this.edges,
      listeners: {
        connect: connection => this.connect.emit(connection),
        connectionDrop: drop => this.connectionDrop.emit(drop),
        nodeMove: move => this.nodeMove.emit(move),
        selectionChange: () =>
          this.selectionChange.emit({
            nodes: [...this.store.selectedNodes()],
            edges: [...this.store.selectedEdges()]
          })
      }
    });

    this.store.setSurface(this.element);

    // The server has no `ResizeObserver` at all, so reaching for one here is a
    // `ReferenceError` inside the constructor — the graph and everything
    // projected into it drop out of the response rather than merely rendering
    // unmeasured. Leaving `surfaceSize` at 0×0 is what the store already treats
    // as "not measured yet", and the browser measures once it takes over.
    //
    // This is `injectXElementSize`'s guard rather than a call to it: the
    // primitive reports the *content* box, and the canvas needs the padding box
    // its own pointer maths is written against.
    if (!this.isBrowser || typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(() =>
      this.store.surfaceSize.set({ width: this.element.clientWidth, height: this.element.clientHeight })
    );

    observer.observe(this.element);
    inject(DestroyRef).onDestroy(() => observer.disconnect());
  }

  /** Frame every node, leaving `padding` screen pixels of margin. */
  fitView(padding?: number): void {
    this.store.fitView(padding);
  }

  zoomIn(): void {
    this.store.zoomBy(this.config.zoomStep);
  }

  zoomOut(): void {
    this.store.zoomBy(1 / this.config.zoomStep);
  }

  /** Return to 1:1 without moving the centre of the view. */
  resetZoom(): void {
    this.store.zoomTo(1);
  }

  private markerUrl(marker: XuiGraphMarker): string | null {
    switch (marker) {
      case 'arrow':
        return `url(#${this.arrowId})`;
      case 'arrow-closed':
        return `url(#${this.arrowClosedId})`;
      case 'dot':
        return `url(#${this.dotId})`;
      default:
        return null;
    }
  }

  protected onEdgePointerDown(edge: XuiGraphEdge, event: PointerEvent): void {
    if (event.button !== 0 || this.locked()) {
      return;
    }

    event.stopPropagation();
    this.store.selectEdge(edge.id, event.shiftKey || event.ctrlKey || event.metaKey);
    this.edgeClick.emit(edge);
  }

  /**
   * Presses that reach here landed on empty canvas — nodes, ports and edges all
   * stop propagation — so this only ever starts a pan or a marquee.
   */
  protected onPointerDown(event: PointerEvent): void {
    const middle = event.button === 1;

    if (event.button !== 0 && !middle) {
      return;
    }

    // Overlay furniture sits above the canvas but still bubbles to it. Capturing
    // the pointer here would retarget the release and the button would never see
    // a click at all, so the whole overlay layer is left alone.
    if ((event.target as HTMLElement).closest('[data-xui-graph-overlay]')) {
      return;
    }

    this.element.focus({ preventScroll: true });
    this.element.setPointerCapture(event.pointerId);
    this.gestureOrigin = { x: event.clientX, y: event.clientY };
    this.gestureMoved = false;

    // Middle-drag always pans, whatever the primary gesture is bound to;
    // shift inverts the primary gesture, which is the convention everywhere.
    const pan = middle || this.panOnDrag() !== event.shiftKey;

    if (pan) {
      this.gesture = 'pan';
      return;
    }

    this.gesture = 'marquee';

    const start = this.store.toGraphPoint(event.clientX, event.clientY);
    this.marqueeState.set({ x: start.x, y: start.y, width: 0, height: 0 });
  }

  protected onPointerMove(event: PointerEvent): void {
    if (this.gesture === 'none') {
      return;
    }

    const dx = event.clientX - this.gestureOrigin.x;
    const dy = event.clientY - this.gestureOrigin.y;

    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      this.gestureMoved = true;
    }

    if (this.gesture === 'pan') {
      this.store.panBy(dx, dy);
      this.gestureOrigin = { x: event.clientX, y: event.clientY };
      return;
    }

    const start = this.store.toGraphPoint(this.gestureOrigin.x, this.gestureOrigin.y);
    const current = this.store.toGraphPoint(event.clientX, event.clientY);

    this.marqueeState.set({
      x: Math.min(start.x, current.x),
      y: Math.min(start.y, current.y),
      width: Math.abs(current.x - start.x),
      height: Math.abs(current.y - start.y)
    });
  }

  protected onPointerUp(event: PointerEvent): void {
    if (this.gesture === 'none') {
      return;
    }

    this.element.releasePointerCapture(event.pointerId);

    const rect = untracked(this.marqueeState);
    const gesture = this.gesture;

    this.gesture = 'none';
    this.marqueeState.set(null);

    if (gesture === 'marquee' && rect && this.gestureMoved) {
      this.store.selectInRect(rect, event.shiftKey || event.ctrlKey || event.metaKey);
      return;
    }

    // A press that never moved is a click on the backdrop: deselect.
    if (!this.gestureMoved) {
      this.store.clearSelection();
    }
  }

  protected onWheel(event: WheelEvent): void {
    if (!this.zoomOnScroll()) {
      return;
    }

    const rect = this.element.getBoundingClientRect();
    const anchor = { x: event.clientX - rect.left, y: event.clientY - rect.top };

    if (this.zoomActivation() === 'ctrl-wheel' && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      this.store.panBy(-event.deltaX, -event.deltaY);
      return;
    }

    event.preventDefault();

    // Exponential in the raw delta so a trackpad's fine-grained events and a
    // mouse wheel's coarse notches both feel proportional.
    this.store.zoomBy(Math.exp(-clamp(event.deltaY, -120, 120) * 0.0025), anchor);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const modifier = event.ctrlKey || event.metaKey;

    if (modifier && event.key.toLowerCase() === 'a') {
      event.preventDefault();
      this.store.selectAll();
      return;
    }

    if (event.key === 'Escape') {
      this.store.endLink(null);
      this.store.clearSelection();
      return;
    }

    if ((event.key === 'Delete' || event.key === 'Backspace') && !this.locked()) {
      const nodes = [...this.store.selectedNodes()];
      const edges = [...this.store.selectedEdges()];

      if (nodes.length || edges.length) {
        event.preventDefault();
        this.deleteSelection.emit({ nodes, edges });
      }

      return;
    }

    const nudge = ARROW_NUDGE[event.key];

    if (nudge && !this.locked() && this.store.selectedNodes().size > 0) {
      event.preventDefault();

      // Shift steps a whole grid cell; a bare arrow moves by one unit, or by the
      // grid when snapping is on and any smaller step would be discarded anyway.
      const step = event.shiftKey || this.snapToGrid() ? this.gridSize() : 1;
      const first = [...this.store.selectedNodes()][0];

      this.store.beginNodeDrag(first);
      this.store.dragNodesBy({ x: nudge.x * step, y: nudge.y * step });
      this.store.endNodeDrag();
    }
  }

  protected onContextMenu(event: MouseEvent): void {
    this.canvasContextMenu.emit({ event, position: this.store.toGraphPoint(event.clientX, event.clientY) });
  }
}

const OPPOSITE = { left: 'right', right: 'left', top: 'bottom', bottom: 'top' } as const;

const ARROW_NUDGE: Record<string, XuiGraphPoint | undefined> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 }
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
