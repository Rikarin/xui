import { computed, inject, Injectable, signal, untracked, type Signal, type WritableSignal } from '@angular/core';
import type { XuiGraphPortType } from './node-graph.token';
import type {
  XuiGraphConnection,
  XuiGraphConnectionDrop,
  XuiGraphConnectionValidator,
  XuiGraphEdge,
  XuiGraphGroupHandle,
  XuiGraphNodeHandle,
  XuiGraphNodeMove,
  XuiGraphPoint,
  XuiGraphPortDescriptor,
  XuiGraphPortHandle,
  XuiGraphPortRef,
  XuiGraphPortShape,
  XuiGraphRect,
  XuiGraphRouting,
  XuiGraphViewport
} from './node-graph.types';
import { xuiGraphPortKey } from './node-graph.types';

/**
 * The subset of the graph's inputs that the store, the nodes and the ports all
 * need to see. Owned by {@link XuiNodeGraph}, which hands the store a signal of
 * it rather than pushing values in from an effect.
 *
 * @internal
 */
export interface XuiGraphSettings {
  routing: XuiGraphRouting;
  gridSize: number;
  snapToGrid: boolean;
  minZoom: number;
  maxZoom: number;
  stubLength: number;
  cornerRadius: number;
  curvature: number;
  edgeWidth: number;
  portSize: number;
  portShape: XuiGraphPortShape;
  portColor: string;
  portTypes: Record<string, XuiGraphPortType>;
  allowSelfConnection: boolean;
  enforcePortTypes: boolean;
  isValidConnection: XuiGraphConnectionValidator | undefined;
  locked: boolean;
}

/** A wire being dragged out of a port. @internal */
export interface XuiGraphLinking {
  /** The port the drag started at — not necessarily the source end. */
  from: XuiGraphPortRef;
  fromKey: string;

  /**
   * `true` when the drag began at an input, so the fixed end is the *target* of
   * the connection that will be produced. Dragging backwards off an input is how
   * every node editor lets you re-route an existing wire.
   */
  reversed: boolean;

  /** Live pointer position in graph space. */
  pointer: XuiGraphPoint;

  /** Key of the port under the pointer, if it is a legal landing spot. */
  hoverKey: string | null;
}

/** A drag in flight, with the group frames frozen as they stood when it began. @internal */
export interface XuiGraphDragState {
  source: 'node' | 'group';

  /** Ids of the nodes actually moving — locked ones are left out. */
  ids: ReadonlySet<string>;
  frames: ReadonlyMap<string, XuiGraphRect>;
}

/** How a port should render while a wire is being dragged. */
export type XuiGraphPortLinkState = 'idle' | 'source' | 'valid' | 'invalid';

/** Callbacks {@link XuiNodeGraph} registers so the store can raise its outputs. @internal */
export interface XuiGraphStoreListeners {
  connect(connection: XuiGraphConnection): void;
  connectionDrop(drop: XuiGraphConnectionDrop): void;
  nodeMove(move: XuiGraphNodeMove): void;
  selectionChange(): void;
}

/**
 * Reactive state shared by a graph and everything inside it.
 *
 * Provided by {@link XuiNodeGraph}, so every node, port and edge in one canvas
 * sees the same instance and two graphs on a page never interfere.
 */
@Injectable()
export class XuiNodeGraphStore {
  private settingsSource: Signal<XuiGraphSettings> | null = null;
  private listeners: XuiGraphStoreListeners | null = null;
  private surface: HTMLElement | null = null;

  /** Node top-left positions captured at the start of a drag, keyed by node id. */
  private dragOrigins = new Map<string, XuiGraphPoint>();
  private dragMoved = false;

  /**
   * The drag in flight, including every group frame as it stood when the drag
   * began. Reactive, because those frozen frames are what the groups *render*
   * while a node is being dragged, not merely what the drop is judged against.
   *
   * Both uses come from the same problem: a frame is sized from its members, so
   * a live frame stretches to follow the very node being dragged out of it and
   * then snaps back on release. Pinning the frame for the duration makes the
   * node visibly leave a box that stays put — and makes the box you can see the
   * box that decides where the node lands.
   */
  private readonly drag = signal<XuiGraphDragState | null>(null);

  /**
   * The graph binds its own `viewport` model and `edges` input here, so those
   * stay the single source of truth and the store never has to mirror them
   * through an effect that could fight the host for ownership.
   */
  private viewportSource: WritableSignal<XuiGraphViewport> | null = null;
  private edgesSource: Signal<readonly XuiGraphEdge[]> | null = null;
  private readonly ownViewport = signal<XuiGraphViewport>({ x: 0, y: 0, zoom: 1 });

  readonly viewport: Signal<XuiGraphViewport> = computed(() => (this.viewportSource ?? this.ownViewport)());
  readonly edges: Signal<readonly XuiGraphEdge[]> = computed(() => this.edgesSource?.() ?? EMPTY_EDGES);
  readonly selectedNodes = signal<ReadonlySet<string>>(new Set());
  readonly selectedEdges = signal<ReadonlySet<string>>(new Set());
  readonly linking = signal<XuiGraphLinking | null>(null);

  /** Size of the visible canvas in screen pixels; kept current by a ResizeObserver. */
  readonly surfaceSize = signal({ width: 0, height: 0 });

  private readonly nodeMap = signal<ReadonlyMap<string, XuiGraphNodeHandle>>(new Map());
  private readonly portMap = signal<ReadonlyMap<string, XuiGraphPortHandle>>(new Map());
  private readonly groupMap = signal<ReadonlyMap<string, XuiGraphGroupHandle>>(new Map());

  readonly nodes = computed(() => [...this.nodeMap().values()]);
  readonly ports = computed(() => [...this.portMap().values()]);
  readonly groups = computed(() => [...this.groupMap().values()]);

  readonly settings = computed<XuiGraphSettings>(() => this.settingsSource?.() ?? FALLBACK_SETTINGS);

  /** How many edges terminate at each port, keyed the same way as the registry. */
  private readonly connectionCounts = computed(() => {
    const counts = new Map<string, number>();

    for (const edge of this.edges()) {
      for (const ref of [edge.source, edge.target]) {
        const key = xuiGraphPortKey(ref.nodeId, ref.portId);
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }

    return counts;
  });

  /**
   * Wire the store to the graph that provides it. Called from the graph's
   * constructor, before anything can read the bound signals.
   *
   * @internal
   */
  configure(bindings: {
    settings: Signal<XuiGraphSettings>;
    viewport: WritableSignal<XuiGraphViewport>;
    edges: Signal<readonly XuiGraphEdge[]>;
    listeners: XuiGraphStoreListeners;
  }): void {
    this.settingsSource = bindings.settings;
    this.viewportSource = bindings.viewport;
    this.edgesSource = bindings.edges;
    this.listeners = bindings.listeners;
  }

  /** Writes through to whichever signal is bound as the viewport. */
  private updateViewport(next: (current: XuiGraphViewport) => XuiGraphViewport): void {
    const target = this.viewportSource ?? this.ownViewport;

    target.set(next(untracked(target)));
  }

  /** @internal */
  setSurface(element: HTMLElement): void {
    this.surface = element;
  }

  // ------------------------------------------------------------------ registry

  /** @internal */
  registerNode(node: XuiGraphNodeHandle): void {
    this.nodeMap.update(map => new Map(map).set(node.nodeId(), node));
  }

  /** @internal */
  unregisterNode(node: XuiGraphNodeHandle): void {
    this.nodeMap.update(map => {
      const next = new Map(map);

      // Guard against a re-registered id: a node that has already been replaced
      // by another instance must not be deleted by its predecessor's teardown.
      if (next.get(node.nodeId()) === node) {
        next.delete(node.nodeId());
      }

      return next;
    });
  }

  /** @internal */
  registerPort(port: XuiGraphPortHandle): void {
    this.portMap.update(map => new Map(map).set(port.key, port));
  }

  /** @internal */
  unregisterPort(port: XuiGraphPortHandle): void {
    this.portMap.update(map => {
      const next = new Map(map);

      if (next.get(port.key) === port) {
        next.delete(port.key);
      }

      return next;
    });
  }

  /** @internal */
  registerGroup(group: XuiGraphGroupHandle): void {
    this.groupMap.update(map => new Map(map).set(group.groupId(), group));
  }

  /** @internal */
  unregisterGroup(group: XuiGraphGroupHandle): void {
    this.groupMap.update(map => {
      const next = new Map(map);

      if (next.get(group.groupId()) === group) {
        next.delete(group.groupId());
      }

      return next;
    });
  }

  node(nodeId: string): XuiGraphNodeHandle | undefined {
    return this.nodeMap().get(nodeId);
  }

  port(key: string): XuiGraphPortHandle | undefined {
    return this.portMap().get(key);
  }

  /**
   * Absolute position of a connector in graph space.
   *
   * Composed from the node's position and the port's node-relative offset rather
   * than measured directly, so dragging a node re-routes its wires from a single
   * signal write with no DOM reads.
   */
  portPoint(key: string): XuiGraphPoint | null {
    const port = this.portMap().get(key);
    const node = port && this.nodeMap().get(port.nodeId());

    if (!port || !node) {
      return null;
    }

    const position = node.position();
    const offset = port.offset();

    return { x: position.x + offset.x, y: position.y + offset.y };
  }

  descriptor(key: string): XuiGraphPortDescriptor | null {
    const port = this.portMap().get(key);

    if (!port) {
      return null;
    }

    return {
      nodeId: port.nodeId(),
      portId: port.portId(),
      direction: port.direction(),
      side: port.resolvedSide(),
      dataType: port.dataType(),
      maxConnections: port.resolvedMaxConnections(),
      disabled: port.disabled(),
      connections: this.connectionCounts().get(key) ?? 0
    };
  }

  connectionCount(key: string): number {
    return this.connectionCounts().get(key) ?? 0;
  }

  // --------------------------------------------------------------- coordinates

  /** Client (viewport) coordinates to graph space. */
  toGraphPoint(clientX: number, clientY: number): XuiGraphPoint {
    const rect = this.surface?.getBoundingClientRect();
    const { x, y, zoom } = this.viewport();

    return {
      x: (clientX - (rect?.left ?? 0) - x) / zoom,
      y: (clientY - (rect?.top ?? 0) - y) / zoom
    };
  }

  /** Graph space to coordinates relative to the canvas element's top-left corner. */
  toSurfacePoint(point: XuiGraphPoint): XuiGraphPoint {
    const { x, y, zoom } = this.viewport();

    return { x: point.x * zoom + x, y: point.y * zoom + y };
  }

  /** Rounds to the nearest grid intersection when snapping is on. */
  snap(point: XuiGraphPoint): XuiGraphPoint {
    const { snapToGrid, gridSize } = this.settings();

    if (!snapToGrid || gridSize <= 0) {
      return point;
    }

    return { x: Math.round(point.x / gridSize) * gridSize, y: Math.round(point.y / gridSize) * gridSize };
  }

  // ------------------------------------------------------------------ viewport

  panBy(dx: number, dy: number): void {
    this.updateViewport(v => ({ ...v, x: v.x + dx, y: v.y + dy }));
  }

  /**
   * Scale about a fixed point, given in surface coordinates.
   *
   * Holding that point still is what makes wheel-zoom feel anchored to the
   * cursor instead of to the centre of the canvas.
   */
  zoomTo(zoom: number, anchor?: XuiGraphPoint): void {
    const { minZoom, maxZoom } = this.settings();

    this.updateViewport(v => {
      const next = Math.min(maxZoom, Math.max(minZoom, zoom));
      const size = this.surfaceSize();
      const point = anchor ?? { x: size.width / 2, y: size.height / 2 };
      const ratio = next / v.zoom;

      return { zoom: next, x: point.x - (point.x - v.x) * ratio, y: point.y - (point.y - v.y) * ratio };
    });
  }

  zoomBy(factor: number, anchor?: XuiGraphPoint): void {
    this.zoomTo(this.viewport().zoom * factor, anchor);
  }

  /** Bounding box of every node, or `null` while the graph is empty. */
  contentBounds(): XuiGraphRect | null {
    const nodes = this.nodes();

    if (nodes.length === 0) {
      return null;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const node of nodes) {
      const { x, y } = node.position();
      const { width, height } = node.size();

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    }

    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }

  /** Frame every node, leaving `padding` screen pixels of margin. */
  fitView(padding = 40): void {
    const bounds = this.contentBounds();
    const { width, height } = this.surfaceSize();

    if (!bounds || width === 0 || height === 0) {
      return;
    }

    const { minZoom, maxZoom } = this.settings();
    const scale = Math.min(
      (width - padding * 2) / Math.max(bounds.width, 1),
      (height - padding * 2) / Math.max(bounds.height, 1)
    );
    const zoom = Math.min(maxZoom, Math.max(minZoom, scale));

    this.updateViewport(() => ({
      zoom,
      x: width / 2 - (bounds.x + bounds.width / 2) * zoom,
      y: height / 2 - (bounds.y + bounds.height / 2) * zoom
    }));
  }

  /** Centre the viewport on a node without changing the zoom. */
  centerOn(nodeId: string): void {
    const node = this.nodeMap().get(nodeId);
    const { width, height } = this.surfaceSize();

    if (!node) {
      return;
    }

    const position = node.position();
    const size = node.size();

    this.updateViewport(v => ({
      ...v,
      x: width / 2 - (position.x + size.width / 2) * v.zoom,
      y: height / 2 - (position.y + size.height / 2) * v.zoom
    }));
  }

  // ----------------------------------------------------------------- selection

  isNodeSelected(nodeId: string): boolean {
    return this.selectedNodes().has(nodeId);
  }

  isEdgeSelected(edgeId: string): boolean {
    return this.selectedEdges().has(edgeId);
  }

  selectNode(nodeId: string, additive = false): void {
    this.selectedNodes.update(current => {
      if (!additive) {
        return current.size === 1 && current.has(nodeId) ? current : new Set([nodeId]);
      }

      const next = new Set(current);
      next.has(nodeId) ? next.delete(nodeId) : next.add(nodeId);

      return next;
    });

    if (!additive) {
      this.selectedEdges.set(new Set());
    }

    this.listeners?.selectionChange();
  }

  selectEdge(edgeId: string, additive = false): void {
    this.selectedEdges.update(current => {
      if (!additive) {
        return current.size === 1 && current.has(edgeId) ? current : new Set([edgeId]);
      }

      const next = new Set(current);
      next.has(edgeId) ? next.delete(edgeId) : next.add(edgeId);

      return next;
    });

    if (!additive) {
      this.selectedNodes.set(new Set());
    }

    this.listeners?.selectionChange();
  }

  setSelection(nodeIds: Iterable<string>, edgeIds: Iterable<string> = []): void {
    this.selectedNodes.set(new Set(nodeIds));
    this.selectedEdges.set(new Set(edgeIds));
    this.listeners?.selectionChange();
  }

  clearSelection(): void {
    if (this.selectedNodes().size === 0 && this.selectedEdges().size === 0) {
      return;
    }

    this.selectedNodes.set(new Set());
    this.selectedEdges.set(new Set());
    this.listeners?.selectionChange();
  }

  selectAll(): void {
    this.setSelection(
      this.nodes().map(node => node.nodeId()),
      this.edges().map(edge => edge.id)
    );
  }

  /** Select every node whose box intersects `rect`, in graph space. */
  selectInRect(rect: XuiGraphRect, additive = false): void {
    const hits = this.nodes()
      .filter(node => {
        const position = node.position();
        const size = node.size();

        return (
          position.x < rect.x + rect.width &&
          position.x + size.width > rect.x &&
          position.y < rect.y + rect.height &&
          position.y + size.height > rect.y
        );
      })
      .map(node => node.nodeId());

    this.setSelection(additive ? [...this.selectedNodes(), ...hits] : hits, additive ? this.selectedEdges() : []);
  }

  // -------------------------------------------------------------------- groups

  /** The nodes that declare themselves members of a group, in registration order. */
  nodesInGroup(groupId: string): XuiGraphNodeHandle[] {
    return this.nodes().filter(node => node.group() === groupId);
  }

  /**
   * The frame a group draws: its members' bounding box, grown by the group's own
   * padding and title bar. A group owns no geometry, so an empty one has no box
   * at all and renders nothing.
   *
   */
  groupBounds(groupId: string): XuiGraphRect | null {
    const group = this.groupMap().get(groupId);
    const members = this.nodesInGroup(groupId);

    if (!group || members.length === 0) {
      return null;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const node of members) {
      const { x, y } = node.position();
      const { width, height } = node.size();

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    }

    const padding = group.padding();
    const header = group.headerHeight();

    return {
      x: minX - padding,
      y: minY - padding - header,
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2 + header
    };
  }

  /**
   * The box a frame should be drawn at right now: its live bounds, except while a
   * node drag is in flight, when it is pinned to where it stood as that drag
   * began. A group being dragged is never pinned — it has to travel with the
   * members it is carrying.
   */
  groupFrame(groupId: string): XuiGraphRect | null {
    const drag = this.drag();

    if (drag?.source === 'node') {
      return drag.frames.get(groupId) ?? this.groupBounds(groupId);
    }

    return this.groupBounds(groupId);
  }

  /**
   * Frames that would take one of the nodes being dragged if it were released
   * now. Groups render this as a highlight, so which frame is about to claim the
   * node is visible before the button comes up rather than after.
   */
  readonly dropTargetGroups = computed<ReadonlySet<string>>(() => {
    const drag = this.drag();

    if (!drag || drag.source === 'group') {
      return EMPTY_IDS;
    }

    const frames = [...drag.frames];
    const targets = new Set<string>();

    for (const id of drag.ids) {
      const node = this.nodeMap().get(id);

      if (!node) {
        continue;
      }

      const position = node.position();
      const size = node.size();
      const hit = smallestContaining({ x: position.x + size.width / 2, y: position.y + size.height / 2 }, frames);

      if (hit) {
        targets.add(hit);
      }
    }

    return targets;
  });

  /**
   * Innermost group frame containing a point. Smallest-first, so a frame nested
   * inside another wins the node that lands in the overlap.
   */
  groupAt(point: XuiGraphPoint): string | undefined {
    const frames = this.groups()
      .map(group => [group.groupId(), this.groupBounds(group.groupId())] as const)
      .filter((entry): entry is readonly [string, XuiGraphRect] => !!entry[1]);

    return smallestContaining(point, frames);
  }

  // ------------------------------------------------------------------ dragging

  /**
   * Capture the starting position of everything a drag will move.
   *
   * Deltas are applied to these captured origins rather than accumulated onto
   * live positions, so snapping cannot compound rounding error over a long drag.
   */
  beginNodeDrag(nodeId: string): void {
    const selected = this.selectedNodes();

    this.captureDrag(selected.has(nodeId) ? selected : [nodeId], 'node');
  }

  /**
   * Drag a whole group: every member moves together, and the frame follows them
   * because it is sized from where they are.
   *
   * @internal
   */
  beginGroupDrag(groupId: string): void {
    this.captureDrag(
      this.nodesInGroup(groupId).map(node => node.nodeId()),
      'group'
    );
  }

  private captureDrag(ids: Iterable<string>, source: 'node' | 'group'): void {
    const frames = new Map<string, XuiGraphRect>();

    this.dragOrigins = new Map();
    this.dragMoved = false;

    for (const group of this.groups()) {
      const bounds = this.groupBounds(group.groupId());

      if (bounds) {
        frames.set(group.groupId(), bounds);
      }
    }

    for (const id of ids) {
      const node = this.nodeMap().get(id);

      if (node && !node.locked()) {
        this.dragOrigins.set(id, node.position());
      }
    }

    this.drag.set({ source, ids: new Set(this.dragOrigins.keys()), frames });
  }

  /** Offset every dragged node from its captured origin, in graph units. */
  dragNodesBy(delta: XuiGraphPoint): void {
    if (delta.x !== 0 || delta.y !== 0) {
      this.dragMoved = true;
    }

    for (const [id, origin] of this.dragOrigins) {
      this.nodeMap()
        .get(id)
        ?.moveTo(this.snap({ x: origin.x + delta.x, y: origin.y + delta.y }));
    }
  }

  /** Ends the drag and raises `nodeMove`. Returns whether anything actually moved. */
  endNodeDrag(): boolean {
    const moved = this.dragMoved;
    const drag = this.drag();
    const source = drag?.source ?? 'node';

    if (moved) {
      const nodes = [...this.dragOrigins.keys()]
        .map(id => this.nodeMap().get(id))
        .filter((node): node is XuiGraphNodeHandle => !!node)
        .map(node => {
          const position = node.position();
          const size = node.size();
          // The centre, not the corner: a node half over a frame's edge reads as
          // being wherever the bulk of it sits.
          const centre = { x: position.x + size.width / 2, y: position.y + size.height / 2 };

          return {
            nodeId: node.nodeId(),
            position,
            // A group drag carries its own members around; none of them can have
            // changed hands, so there is nothing to report.
            group: source === 'group' || !drag ? undefined : smallestContaining(centre, drag.frames)
          };
        });

      this.listeners?.nodeMove({ source, nodes });
    }

    this.dragOrigins = new Map();
    this.dragMoved = false;
    this.drag.set(null);

    return moved;
  }

  // ------------------------------------------------------------------- linking

  /** @internal */
  beginLink(port: XuiGraphPortHandle, pointer: XuiGraphPoint): void {
    this.linking.set({
      from: { nodeId: port.nodeId(), portId: port.portId() },
      fromKey: port.key,
      reversed: port.direction() === 'input',
      pointer,
      hoverKey: null
    });
  }

  /** @internal */
  moveLink(pointer: XuiGraphPoint): void {
    this.linking.update(state => (state ? { ...state, pointer } : null));
  }

  /** @internal */
  setLinkHover(key: string | null): void {
    this.linking.update(state => (state ? { ...state, hoverKey: key } : null));
  }

  /**
   * Finish a link. Dropping on a legal port raises `connect`; dropping anywhere
   * else raises `connectionDrop` so the host can offer to create a node there.
   *
   * @internal
   */
  endLink(dropKey: string | null): void {
    const state = this.linking();
    this.linking.set(null);

    if (!state) {
      return;
    }

    const connection = dropKey && this.orient(state, dropKey);

    if (connection && this.canConnect(connection)) {
      this.listeners?.connect(connection);
      return;
    }

    if (!dropKey) {
      const port = this.descriptor(state.fromKey);

      if (port) {
        this.listeners?.connectionDrop({
          source: state.from,
          port,
          position: state.pointer,
          surfacePosition: this.toSurfacePoint(state.pointer)
        });
      }
    }
  }

  /** Resolve which end of a dragged wire is the source. */
  private orient(state: XuiGraphLinking, dropKey: string): XuiGraphConnection | null {
    const dropped = this.portMap().get(dropKey);

    if (!dropped) {
      return null;
    }

    const droppedRef = { nodeId: dropped.nodeId(), portId: dropped.portId() };

    return state.reversed ? { source: droppedRef, target: state.from } : { source: state.from, target: droppedRef };
  }

  /**
   * How a port should render while a wire is in flight — the affordance that
   * tells you where a wire may land before you release it.
   */
  linkState(key: string): XuiGraphPortLinkState {
    const state = this.linking();

    if (!state) {
      return 'idle';
    }

    if (state.fromKey === key) {
      return 'source';
    }

    const connection = this.orient(state, key);

    return connection && this.canConnect(connection) ? 'valid' : 'invalid';
  }

  /**
   * The full connection rule set: existence, arity, direction, duplicates and
   * data type, then the host's own validator, which can only narrow the result.
   */
  canConnect(connection: XuiGraphConnection): boolean {
    const settings = this.settings();

    if (settings.locked) {
      return false;
    }

    const sourceKey = xuiGraphPortKey(connection.source.nodeId, connection.source.portId);
    const targetKey = xuiGraphPortKey(connection.target.nodeId, connection.target.portId);

    if (sourceKey === targetKey) {
      return false;
    }

    const source = this.descriptor(sourceKey);
    const target = this.descriptor(targetKey);

    if (!source || !target || source.disabled || target.disabled) {
      return false;
    }

    if (!settings.allowSelfConnection && source.nodeId === target.nodeId) {
      return false;
    }

    // An `inout` port plays either role; a plain input can never be a source.
    if (source.direction === 'input' || target.direction === 'output') {
      return false;
    }

    if (source.connections >= source.maxConnections || target.connections >= target.maxConnections) {
      return false;
    }

    const edges = this.edges();
    const duplicate = edges.some(
      edge => samePort(edge.source, connection.source) && samePort(edge.target, connection.target)
    );

    if (duplicate) {
      return false;
    }

    // An undeclared type is a wildcard, so untyped graphs need no configuration.
    if (settings.enforcePortTypes && source.dataType && target.dataType && source.dataType !== target.dataType) {
      return false;
    }

    return settings.isValidConnection?.(connection, { source, target, edges }) ?? true;
  }
}

/**
 * The smallest of the frames containing a point, so a frame nested inside
 * another wins the node that lands in the overlap.
 */
function smallestContaining(
  point: XuiGraphPoint,
  frames: Iterable<readonly [string, XuiGraphRect]>
): string | undefined {
  let best: string | undefined;
  let bestArea = Infinity;

  for (const [id, bounds] of frames) {
    const inside =
      point.x >= bounds.x &&
      point.x <= bounds.x + bounds.width &&
      point.y >= bounds.y &&
      point.y <= bounds.y + bounds.height;
    const area = bounds.width * bounds.height;

    if (inside && area < bestArea) {
      bestArea = area;
      best = id;
    }
  }

  return best;
}

/** Shared so the `edges` computed keeps a stable identity while unbound. */
const EMPTY_EDGES: readonly XuiGraphEdge[] = [];
const EMPTY_IDS: ReadonlySet<string> = new Set();

function samePort(a: XuiGraphPortRef, b: XuiGraphPortRef): boolean {
  return a.nodeId === b.nodeId && a.portId === b.portId;
}

/** Used only if a node or port is somehow instantiated outside a graph. @internal */
const FALLBACK_SETTINGS: XuiGraphSettings = {
  routing: 'bezier',
  gridSize: 16,
  snapToGrid: false,
  minZoom: 0.15,
  maxZoom: 4,
  stubLength: 18,
  cornerRadius: 8,
  curvature: 0.5,
  edgeWidth: 2,
  portSize: 11,
  portShape: 'circle',
  portColor: 'var(--color-foreground-subtle)',
  portTypes: {},
  allowSelfConnection: false,
  enforcePortTypes: true,
  isValidConnection: undefined,
  locked: false
};

/**
 * The store for the enclosing `<xui-node-graph>`.
 *
 * Use it to drive the canvas from outside — `fitView()`, `zoomBy()`,
 * `setSelection()` — from a toolbar or a host component.
 */
export function injectXuiNodeGraphStore(): XuiNodeGraphStore {
  return inject(XuiNodeGraphStore);
}
