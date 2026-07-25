import type { Signal } from '@angular/core';

/** A point in *graph space* — the untransformed coordinate system nodes live in. */
export interface XuiGraphPoint {
  x: number;
  y: number;
}

/** A size in graph space. Screen pixels only match at zoom 1. */
export interface XuiGraphSize {
  width: number;
  height: number;
}

export interface XuiGraphRect extends XuiGraphPoint, XuiGraphSize {}

/**
 * The pan/zoom state of the canvas. `x`/`y` are a *screen-pixel* translation
 * applied after scaling, so `screen = graph * zoom + pan`.
 */
export interface XuiGraphViewport extends XuiGraphPoint {
  zoom: number;
}

/**
 * Which way data flows through a port. `inout` is the bidirectional case that
 * electrical schematics need — a terminal is neither a source nor a sink, and a
 * wire may be drawn from either end.
 */
export type XuiGraphPortDirection = 'input' | 'output' | 'inout';

/** Which edge of the node the connector sits on. Drives layout and edge routing. */
export type XuiGraphPortSide = 'left' | 'right' | 'top' | 'bottom';

/**
 * The connector glyph. `circle` reads as a data socket (VFX/shader graphs),
 * `pin` as a component lead (schematics), and the rest are available to encode a
 * second dimension — by convention `diamond` marks an optional/nullable input.
 */
export type XuiGraphPortShape = 'circle' | 'square' | 'diamond' | 'triangle' | 'pin';

/** How ports are arranged inside a node's body. */
export type XuiGraphPortLayout = 'stacked' | 'columns';

/**
 * Edge geometry.
 *
 * - `bezier` — cubic curve leaving each port along its normal. The node-editor default.
 * - `orthogonal` — axis-aligned segments with sharp corners. The schematic default.
 * - `smoothstep` — orthogonal with rounded corners.
 * - `straight` — a single line.
 */
export type XuiGraphRouting = 'bezier' | 'orthogonal' | 'smoothstep' | 'straight';

/** Decoration drawn at the target end of an edge. */
export type XuiGraphMarker = 'none' | 'arrow' | 'arrow-closed' | 'dot';

/** The canvas backdrop. `grid` draws a minor/major rule pair, as schematic paper does. */
export type XuiGraphBackground = 'none' | 'dots' | 'grid';

/** Addresses one connector: a port is only unique within its node. */
export interface XuiGraphPortRef {
  nodeId: string;
  portId: string;
}

/** A connection the user has drawn but that the model does not contain yet. */
export interface XuiGraphConnection {
  source: XuiGraphPortRef;
  target: XuiGraphPortRef;
}

/**
 * A wire between two ports. Purely declarative and serialisable — geometry is
 * derived from the live position of the two ports, never stored here.
 */
export interface XuiGraphEdge {
  id: string;

  /** Where the wire starts. For `inout` ports this is simply the end drawn first. */
  source: XuiGraphPortRef;
  target: XuiGraphPortRef;

  /** Overrides the routing the graph is configured with, per edge. */
  routing?: XuiGraphRouting;

  /** Overrides the colour inherited from the source port's data type. */
  color?: string;

  /** Text rendered at the midpoint of the wire. */
  label?: string;

  /** Marching-ants animation, for showing that data or current is flowing. */
  animated?: boolean;

  dashed?: boolean;

  /** Stroke width in graph units. Defaults to the graph's `edgeWidth`. */
  width?: number;

  marker?: XuiGraphMarker;

  /** Arbitrary payload carried through selection and click events. */
  data?: unknown;
}

/**
 * A flattened, framework-free view of a port, handed to
 * {@link XuiGraphConnectionValidator} so validation logic never touches
 * component instances.
 */
export interface XuiGraphPortDescriptor extends XuiGraphPortRef {
  direction: XuiGraphPortDirection;
  side: XuiGraphPortSide;
  dataType: string | undefined;
  maxConnections: number;
  disabled: boolean;

  /** How many edges already terminate here. */
  connections: number;
}

/** The two ends of a proposed connection, resolved against the live port registry. */
export interface XuiGraphConnectionContext {
  source: XuiGraphPortDescriptor;
  target: XuiGraphPortDescriptor;
  edges: readonly XuiGraphEdge[];
}

/**
 * Returns whether a connection may be made. Runs *after* the built-in rules
 * (direction, arity, duplicates, data type), so it can only narrow them.
 */
export type XuiGraphConnectionValidator = (
  connection: XuiGraphConnection,
  context: XuiGraphConnectionContext
) => boolean;

/** Emitted when a wire is dropped on empty canvas, for "drag out to create a node". */
export interface XuiGraphConnectionDrop {
  source: XuiGraphPortRef;

  /**
   * The port the wire came from, described in full so a create menu can filter
   * itself to what would actually connect without looking the port up again.
   */
  port: XuiGraphPortDescriptor;

  /** Where the pointer was released, in graph space — where a new node belongs. */
  position: XuiGraphPoint;

  /**
   * The same release point relative to the canvas element's top-left corner, so
   * a popup can be placed without converting through the viewport.
   */
  surfacePosition: XuiGraphPoint;
}

/** One node's resting place after a drag. */
export interface XuiGraphNodeMoved {
  nodeId: string;
  position: XuiGraphPoint;

  /**
   * Innermost group frame the node's centre now sits inside, ignoring the nodes
   * that moved with it — the hook for "drag a node into a frame to join it".
   *
   * `undefined` when it came to rest outside every frame, and always `undefined`
   * for a group drag, where no node changed hands.
   */
  group: string | undefined;
}

/** Emitted whenever a drag settles, with the final position of every moved node. */
export interface XuiGraphNodeMove {
  /** Whether the gesture started on a node (or node selection) or on a group frame. */
  source: 'node' | 'group';
  nodes: readonly XuiGraphNodeMoved[];
}

/**
 * The contract {@link XuiGraphNode} fulfils for the store.
 *
 * Declared here rather than imported from the component so that the store, the
 * routing helpers and the node itself do not form an import cycle.
 *
 * @internal
 */
export interface XuiGraphNodeHandle {
  readonly nodeId: Signal<string>;
  readonly position: Signal<XuiGraphPoint>;
  readonly size: Signal<XuiGraphSize>;
  readonly locked: Signal<boolean>;

  /** Id of the group frame this node belongs to, if any. */
  readonly group: Signal<string | undefined>;

  readonly element: HTMLElement;
  moveTo(point: XuiGraphPoint): void;
}

/**
 * The contract {@link XuiGraphGroup} fulfils for the store.
 *
 * A group owns no geometry of its own — it is sized from its members — so the
 * store keeps only the knobs it needs in order to compute that box itself.
 *
 * @internal
 */
export interface XuiGraphGroupHandle {
  readonly groupId: Signal<string>;

  /** Blank margin between the members' bounding box and the frame, in graph units. */
  readonly padding: Signal<number>;

  /** Extra room reserved above the members for the frame's title bar. */
  readonly headerHeight: Signal<number>;

  readonly locked: Signal<boolean>;
}

/**
 * The contract {@link XuiGraphPort} fulfils for the store.
 *
 * @internal
 */
export interface XuiGraphPortHandle {
  readonly key: string;
  readonly nodeId: Signal<string>;
  readonly portId: Signal<string>;
  readonly direction: Signal<XuiGraphPortDirection>;
  readonly resolvedSide: Signal<XuiGraphPortSide>;
  readonly dataType: Signal<string | undefined>;
  readonly resolvedMaxConnections: Signal<number>;
  readonly disabled: Signal<boolean>;
  readonly resolvedColor: Signal<string>;

  /** Connector centre relative to the owning node's top-left corner, in graph units. */
  readonly offset: Signal<XuiGraphPoint>;
}

/**
 * Composite key for the port registry. A port id is only unique within its node.
 *
 * Length-prefixed so the pair can never be ambiguous: a node called `a` with a
 * port called `b:c` and a node called `a:b` with a port called `c` must not
 * collide, which any plain separator would allow.
 */
export function xuiGraphPortKey(nodeId: string, portId: string): string {
  return `${nodeId.length}:${nodeId}:${portId}`;
}
