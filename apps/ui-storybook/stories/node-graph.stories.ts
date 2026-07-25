import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  signal,
  viewChild,
  type WritableSignal
} from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import {
  XuiNodeGraph,
  XuiNodeGraphImports,
  type XuiGraphConnection,
  type XuiGraphConnectionDrop,
  type XuiGraphEdge,
  type XuiGraphNodeMove,
  type XuiGraphPoint,
  type XuiGraphPortDescriptor,
  type XuiGraphPortDirection,
  type XuiGraphPortShape,
  type XuiGraphRouting
} from '@xui/node-graph';

interface DemoPort {
  id: string;
  label?: string;
  direction: XuiGraphPortDirection;
  dataType?: string;
  side?: 'left' | 'right' | 'top' | 'bottom';
  shape?: XuiGraphPortShape;
}

interface DemoNode {
  id: string;
  label: string;
  accent?: string;
  width?: number;
  position: WritableSignal<XuiGraphPoint>;

  /** Writable so a node dropped on a frame can be adopted by it. */
  group: WritableSignal<string | undefined>;
  ports: DemoPort[];
}

interface DemoGroup {
  id: string;
  label?: string;
  color?: string;
}

/** Menu box metrics, so it can be kept inside the canvas before it is rendered. */
const MENU_WIDTH = 208;
const MENU_HEADER = 32;
const MENU_ROW = 30;
const MENU_MARGIN = 8;

/** One entry in the palette the create-on-drop menu offers. */
interface CatalogEntry {
  label: string;
  accent?: string;
  ports: DemoPort[];
}

const node = (id: string, label: string, x: number, y: number, ports: DemoPort[], extra: Partial<DemoNode> = {}) =>
  ({ id, label, position: signal({ x, y }), group: signal(undefined), ports, ...extra }) satisfies DemoNode;

/** A shader-style palette: one colour per data type, taken from the chart ramp. */
const SHADER_PORT_TYPES = {
  float: { color: 'var(--color-chart-3)', label: 'Float' },
  vector: { color: 'var(--color-chart-1)', label: 'Vector' },
  color: { color: 'var(--color-chart-4)', label: 'Colour' },
  texture: { color: 'var(--color-chart-7)', label: 'Texture' }
};

/**
 * The shared editing behaviour every demo needs: hold the nodes and edges, accept
 * approved connections, drop the selection on Delete, and — where a catalog is
 * supplied — offer a create menu when a wire is let go on empty canvas.
 */
@Component({
  selector: 'xui-story-graph',
  imports: [XuiNodeGraphImports],
  template: `
    <xui-node-graph
      #graph
      class="border-border h-[560px] rounded-lg border"
      [edges]="edges()"
      [routing]="routing()"
      [background]="background()"
      [gridSize]="gridSize()"
      [snapToGrid]="snapToGrid()"
      [portTypes]="portTypes()"
      [portShape]="portShape()"
      [marker]="marker()"
      (connect)="onConnect($event)"
      (connectionDrop)="onConnectionDrop($event)"
      (nodeMove)="onNodeMove($event)"
      (deleteSelection)="onDelete($event)"
    >
      @for (group of groups(); track group.id) {
        <xui-graph-group [groupId]="group.id" [label]="group.label ?? ''" [color]="group.color ?? ''" />
      }

      @for (item of nodeList(); track item.id) {
        <xui-graph-node
          [nodeId]="item.id"
          [label]="item.label"
          [accent]="item.accent"
          [width]="item.width"
          [group]="item.group()"
          [portLayout]="portLayout()"
          [collapsible]="collapsible()"
          [(position)]="item.position"
        >
          @for (port of item.ports; track port.id) {
            <xui-graph-port
              [portId]="port.id"
              [label]="port.label ?? ''"
              [direction]="port.direction"
              [dataType]="port.dataType"
              [side]="port.side"
              [shape]="port.shape"
            />
          }
        </xui-graph-node>
      }

      <!--
        One overlay element, always projected, with the menu conditional *inside*
        it. Content inside an @if is projected as a single embedded view, so an
        overlay wrapped in one would fall into the canvas layer instead of this
        one and pan away with the graph.
      -->
      <xui-graph-overlay class="inset-0" [class.pointer-events-none]="!menu()">
        @if (menu(); as open) {
          <!-- Backdrop: a press anywhere outside the menu dismisses it. -->
          <div class="absolute inset-0" (pointerdown)="menu.set(null)"></div>

          <div
            class="bg-surface-overlay border-border shadow-elevation-3 absolute w-52 overflow-hidden rounded-md border py-1"
            [style.left.px]="open.at.x"
            [style.top.px]="open.at.y"
          >
            <p class="text-foreground-subtle px-3 pt-1 pb-1.5 text-[10px] tracking-wide uppercase">
              {{ open.options.length ? 'Add node' : 'Nothing accepts ' + (open.drop.port.dataType ?? 'this') }}
            </p>

            @for (option of open.options; track option.label) {
              <button
                type="button"
                class="hover:bg-hover-overlay flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left text-xs"
                (click)="create(option, open.drop)"
              >
                <span class="h-2.5 w-2.5 shrink-0 rounded-full" [style.background]="option.accent"></span>
                {{ option.label }}
              </button>
            }
          </div>
        }
      </xui-graph-overlay>

      <xui-graph-controls />
      <xui-graph-minimap />
    </xui-node-graph>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class StoryGraph {
  readonly nodes = input.required<DemoNode[]>();
  readonly groups = input<DemoGroup[]>([]);
  readonly initialEdges = input<XuiGraphEdge[]>([]);
  readonly catalog = input<CatalogEntry[]>([]);
  readonly routing = input<XuiGraphRouting>('bezier');
  readonly background = input<'none' | 'dots' | 'grid'>('dots');
  readonly gridSize = input(16);
  readonly snapToGrid = input(false);
  readonly portTypes = input<Record<string, { color: string; label?: string }>>({});
  readonly portShape = input<XuiGraphPortShape>('circle');
  readonly portLayout = input<'stacked' | 'columns'>('stacked');
  readonly marker = input<'none' | 'arrow' | 'arrow-closed' | 'dot'>('none');
  readonly collapsible = input(false);

  /** Re-parent a node into whichever frame it was dropped on. */
  readonly adoptOnDrop = input(false);

  private readonly graph = viewChild.required<XuiNodeGraph>('graph');

  /** Seeded from the input, but writable so the create menu can add to it. */
  protected readonly nodeList = linkedSignal(() => [...this.nodes()]);
  protected readonly menu = signal<{ drop: XuiGraphConnectionDrop; at: XuiGraphPoint; options: CatalogEntry[] } | null>(
    null
  );

  private readonly added = signal<XuiGraphEdge[]>([]);
  private readonly removed = signal<ReadonlySet<string>>(new Set());
  private created = 0;

  protected readonly edges = computed(() =>
    [...this.initialEdges(), ...this.added()].filter(edge => !this.removed().has(edge.id))
  );

  protected onConnect(connection: XuiGraphConnection): void {
    this.addEdge(connection);
  }

  /**
   * A wire let go on empty canvas. The graph reports where it landed and which
   * port it came from, so the menu can be placed there and filtered to the node
   * types that would actually accept the connection.
   */
  protected onConnectionDrop(drop: XuiGraphConnectionDrop): void {
    if (this.catalog().length === 0) {
      return;
    }

    const options = this.catalog().filter(entry => !!this.matchingPort(entry, drop.port));

    this.menu.set({ drop, at: this.keepOnCanvas(drop.surfacePosition, options.length), options });
  }

  /**
   * Nudge the menu back inside the canvas. The graph clips its own overflow, so a
   * wire released near an edge would otherwise open a menu that is half cut off
   * and, below the bottom edge, not clickable at all.
   */
  private keepOnCanvas(at: XuiGraphPoint, optionCount: number): XuiGraphPoint {
    const surface = this.graph().store.surfaceSize();
    const height = MENU_HEADER + optionCount * MENU_ROW;

    return {
      x: Math.max(0, Math.min(at.x, surface.width - MENU_WIDTH - MENU_MARGIN)),
      y: Math.max(0, Math.min(at.y, surface.height - height - MENU_MARGIN))
    };
  }

  protected create(entry: CatalogEntry, drop: XuiGraphConnectionDrop): void {
    const port = this.matchingPort(entry, drop.port);

    this.menu.set(null);

    if (!port) {
      return;
    }

    const id = `${entry.label.toLowerCase().replace(/\W+/g, '-')}-${++this.created}`;
    const created = node(id, entry.label, drop.position.x, drop.position.y - 20, entry.ports, {
      accent: entry.accent,
      width: 170
    });

    this.nodeList.update(nodes => [...nodes, created]);

    // The wire keeps the direction it was drawn in: a drag off an input makes
    // the new node the source.
    const end = { nodeId: id, portId: port.id };

    this.addEdge(
      drop.port.direction === 'input' ? { source: end, target: drop.source } : { source: drop.source, target: end }
    );
  }

  protected onNodeMove(move: XuiGraphNodeMove): void {
    if (!this.adoptOnDrop() || move.source === 'group') {
      return;
    }

    for (const moved of move.nodes) {
      this.nodeList()
        .find(item => item.id === moved.nodeId)
        ?.group.set(moved.group);
    }
  }

  protected onDelete({ edges }: { nodes: string[]; edges: string[] }): void {
    this.removed.update(current => new Set([...current, ...edges]));
  }

  /** The first port on a catalog entry that could take the wire being dropped. */
  private matchingPort(entry: CatalogEntry, from: XuiGraphPortDescriptor): DemoPort | undefined {
    const wanted = from.direction === 'input' ? 'output' : 'input';

    return entry.ports.find(
      port =>
        (port.direction === 'inout' || port.direction === wanted) &&
        (!port.dataType || !from.dataType || port.dataType === from.dataType)
    );
  }

  private addEdge(connection: XuiGraphConnection): void {
    const id = `${connection.source.nodeId}.${connection.source.portId}->${connection.target.nodeId}.${connection.target.portId}`;

    this.added.update(edges => [...edges, { id, ...connection }]);
  }
}

const meta: Meta<XuiNodeGraph> = {
  title: 'Visualisation/Node graph',
  component: XuiNodeGraph,
  decorators: [moduleMetadata({ imports: [XuiNodeGraphImports, StoryGraph] })],
  parameters: {
    docs: {
      description: {
        component:
          'A canvas for node-based editors and schematics. Drag a connector to wire two ports, ' +
          'drag a node to move it, drag the background to pan, wheel to zoom, and press Delete to ' +
          'remove the selection.'
      }
    }
  }
};

export default meta;
type Story = StoryObj<XuiNodeGraph>;

const SHADER_NODES: DemoNode[] = [
  node(
    'tex',
    'Texture Sample',
    40,
    60,
    [
      { id: 'uv', label: 'UV', direction: 'input', dataType: 'vector' },
      { id: 'tex', label: 'Texture', direction: 'input', dataType: 'texture' },
      { id: 'rgb', label: 'RGB', direction: 'output', dataType: 'color' },
      { id: 'a', label: 'Alpha', direction: 'output', dataType: 'float' }
    ],
    { accent: 'var(--color-chart-7)', width: 190 }
  ),
  node(
    'fresnel',
    'Fresnel',
    40,
    290,
    [
      { id: 'power', label: 'Power', direction: 'input', dataType: 'float' },
      { id: 'out', label: 'Out', direction: 'output', dataType: 'float' }
    ],
    { accent: 'var(--color-chart-3)', width: 170 }
  ),
  node(
    'mul',
    'Multiply',
    300,
    210,
    [
      { id: 'a', label: 'A', direction: 'input', dataType: 'float' },
      { id: 'b', label: 'B', direction: 'input', dataType: 'float' },
      { id: 'out', label: 'Result', direction: 'output', dataType: 'float' }
    ],
    { accent: 'var(--color-chart-2)', width: 160 }
  ),
  node(
    'out',
    'Material Output',
    540,
    100,
    [
      { id: 'base', label: 'Base Colour', direction: 'input', dataType: 'color' },
      { id: 'metallic', label: 'Metallic', direction: 'input', dataType: 'float' },
      { id: 'rough', label: 'Roughness', direction: 'input', dataType: 'float' }
    ],
    { accent: 'var(--color-primary)', width: 200 }
  )
];

const SHADER_EDGES: XuiGraphEdge[] = [
  { id: 'e1', source: { nodeId: 'tex', portId: 'rgb' }, target: { nodeId: 'out', portId: 'base' } },
  { id: 'e2', source: { nodeId: 'tex', portId: 'a' }, target: { nodeId: 'mul', portId: 'a' } },
  { id: 'e3', source: { nodeId: 'fresnel', portId: 'out' }, target: { nodeId: 'mul', portId: 'b' } },
  { id: 'e4', source: { nodeId: 'mul', portId: 'out' }, target: { nodeId: 'out', portId: 'rough' } }
];

/**
 * The node-editor default: curved wires, typed connectors coloured by data type,
 * and a dot grid. Try dragging from the green `Alpha` output onto the orange
 * `Base Colour` input — the type mismatch dims it and the drop is refused.
 */
export const ShaderGraph: Story = {
  render: () => ({
    props: { nodes: SHADER_NODES, edges: SHADER_EDGES, types: SHADER_PORT_TYPES },
    template: `<xui-story-graph [nodes]="nodes" [initialEdges]="edges" [portTypes]="types" collapsible />`
  })
};

const SCHEMATIC_NODES: DemoNode[] = [
  node(
    'v1',
    'V1 · 9V',
    60,
    200,
    [
      { id: 'pos', label: '+', direction: 'inout', side: 'top', shape: 'pin' },
      { id: 'neg', label: '−', direction: 'inout', side: 'bottom', shape: 'pin' }
    ],
    { accent: 'var(--color-error)', width: 110 }
  ),
  node(
    'r1',
    'R1 · 10k',
    280,
    100,
    [
      { id: 'a', direction: 'inout', side: 'left', shape: 'pin' },
      { id: 'b', direction: 'inout', side: 'right', shape: 'pin' }
    ],
    { width: 130 }
  ),
  node(
    'r2',
    'R2 · 4k7',
    500,
    100,
    [
      { id: 'a', direction: 'inout', side: 'left', shape: 'pin' },
      { id: 'b', direction: 'inout', side: 'right', shape: 'pin' }
    ],
    { width: 130 }
  ),
  node(
    'c1',
    'C1 · 100n',
    500,
    280,
    [
      { id: 'a', direction: 'inout', side: 'top', shape: 'pin' },
      { id: 'b', direction: 'inout', side: 'bottom', shape: 'pin' }
    ],
    { width: 130 }
  ),
  node('gnd', 'GND', 280, 400, [{ id: 'p', direction: 'inout', side: 'top', shape: 'pin' }], { width: 100 })
];

const SCHEMATIC_EDGES: XuiGraphEdge[] = [
  { id: 'w1', source: { nodeId: 'v1', portId: 'pos' }, target: { nodeId: 'r1', portId: 'a' } },
  { id: 'w2', source: { nodeId: 'r1', portId: 'b' }, target: { nodeId: 'r2', portId: 'a' } },
  { id: 'w3', source: { nodeId: 'r2', portId: 'b' }, target: { nodeId: 'c1', portId: 'a' } },
  { id: 'w4', source: { nodeId: 'c1', portId: 'b' }, target: { nodeId: 'gnd', portId: 'p' }, label: '0V' },
  { id: 'w5', source: { nodeId: 'v1', portId: 'neg' }, target: { nodeId: 'gnd', portId: 'p' } }
];

/**
 * The same components configured for circuit work: orthogonal wires, a ruled
 * grid that nodes snap to, pin-shaped terminals on all four sides, and `inout`
 * ports so a wire can be drawn from either end and a node can take many wires.
 */
export const Schematic: Story = {
  render: () => ({
    props: { nodes: SCHEMATIC_NODES, edges: SCHEMATIC_EDGES },
    template: `
      <xui-story-graph
        [nodes]="nodes"
        [initialEdges]="edges"
        routing="orthogonal"
        background="grid"
        [gridSize]="20"
        [snapToGrid]="true"
        portShape="pin"
        portLayout="columns"
      />`
  })
};

const GROUPED_NODES: DemoNode[] = [
  node(
    'osc',
    'Oscillator',
    80,
    120,
    [
      { id: 'freq', label: 'Freq', direction: 'input', dataType: 'float' },
      { id: 'out', label: 'Out', direction: 'output', dataType: 'float' }
    ],
    { accent: 'var(--color-chart-1)', width: 160, group: signal<string | undefined>('synth') }
  ),
  node(
    'filter',
    'Low Pass',
    300,
    180,
    [
      { id: 'in', label: 'In', direction: 'input', dataType: 'float' },
      { id: 'cutoff', label: 'Cutoff', direction: 'input', dataType: 'float' },
      { id: 'out', label: 'Out', direction: 'output', dataType: 'float' }
    ],
    { accent: 'var(--color-chart-1)', width: 160, group: signal<string | undefined>('synth') }
  ),
  node(
    'lfo',
    'LFO',
    80,
    420,
    [
      { id: 'rate', label: 'Rate', direction: 'input', dataType: 'float' },
      { id: 'out', label: 'Out', direction: 'output', dataType: 'float' }
    ],
    { accent: 'var(--color-chart-5)', width: 160, group: signal<string | undefined>('mod') }
  ),
  node('amp', 'Amp', 620, 200, [{ id: 'in', label: 'In', direction: 'input', dataType: 'float' }], {
    accent: 'var(--color-primary)',
    width: 150
  })
];

const GROUPED_EDGES: XuiGraphEdge[] = [
  { id: 'g1', source: { nodeId: 'osc', portId: 'out' }, target: { nodeId: 'filter', portId: 'in' } },
  { id: 'g2', source: { nodeId: 'lfo', portId: 'out' }, target: { nodeId: 'filter', portId: 'cutoff' } },
  { id: 'g3', source: { nodeId: 'filter', portId: 'out' }, target: { nodeId: 'amp', portId: 'in' } }
];

/**
 * Frames gather nodes and move them together.
 *
 * **Move a group** — drag the frame anywhere on it, not just the title, and its
 * whole membership travels with it, wires and all.
 *
 * **Move a node into or out of one** — just drag the node. While you do, every
 * frame holds still at the box it had when you started, and the one that would
 * claim the node lights up, so where it will land is visible before you let go.
 * Drag `Amp` onto the blue frame to see it join; drag `LFO` out of the pink one
 * to see it leave.
 *
 * A frame owns no geometry: it is sized from wherever its members are, so it
 * re-fits once the drag settles, and an empty one renders nothing.
 *
 * Membership is declared on the node (`group="synth"`), not by nesting. The graph
 * reports the frame a node came to rest in and the host reassigns it — this story
 * turns that on with `adoptOnDrop`.
 */
export const Groups: Story = {
  render: () => ({
    props: {
      nodes: GROUPED_NODES,
      edges: GROUPED_EDGES,
      types: SHADER_PORT_TYPES,
      groups: [
        { id: 'synth', label: 'Voice', color: 'var(--color-chart-1)' },
        { id: 'mod', label: 'Modulation', color: 'var(--color-chart-5)' }
      ]
    },
    template: `
      <xui-story-graph
        [nodes]="nodes"
        [groups]="groups"
        [initialEdges]="edges"
        [portTypes]="types"
        [adoptOnDrop]="true"
      />`
  })
};

/** The palette the create-on-drop menu offers, one entry per node type. */
const CATALOG: CatalogEntry[] = [
  {
    label: 'Multiply',
    accent: 'var(--color-chart-2)',
    ports: [
      { id: 'a', label: 'A', direction: 'input', dataType: 'float' },
      { id: 'b', label: 'B', direction: 'input', dataType: 'float' },
      { id: 'out', label: 'Result', direction: 'output', dataType: 'float' }
    ]
  },
  {
    label: 'Clamp',
    accent: 'var(--color-chart-3)',
    ports: [
      { id: 'in', label: 'Value', direction: 'input', dataType: 'float' },
      { id: 'out', label: 'Out', direction: 'output', dataType: 'float' }
    ]
  },
  {
    label: 'Mix Colour',
    accent: 'var(--color-chart-4)',
    ports: [
      { id: 'a', label: 'A', direction: 'input', dataType: 'color' },
      { id: 'b', label: 'B', direction: 'input', dataType: 'color' },
      { id: 'out', label: 'Out', direction: 'output', dataType: 'color' }
    ]
  },
  {
    label: 'To Vector',
    accent: 'var(--color-chart-1)',
    ports: [
      { id: 'in', label: 'Scalar', direction: 'input', dataType: 'float' },
      { id: 'out', label: 'Vector', direction: 'output', dataType: 'vector' }
    ]
  },
  {
    label: 'Material Output',
    accent: 'var(--color-primary)',
    ports: [
      { id: 'base', label: 'Base Colour', direction: 'input', dataType: 'color' },
      { id: 'rough', label: 'Roughness', direction: 'input', dataType: 'float' }
    ]
  }
];

const DROP_NODES: DemoNode[] = [
  node(
    'noise',
    'Noise',
    80,
    140,
    [
      { id: 'scale', label: 'Scale', direction: 'input', dataType: 'float' },
      { id: 'value', label: 'Value', direction: 'output', dataType: 'float' },
      { id: 'colour', label: 'Colour', direction: 'output', dataType: 'color' }
    ],
    { accent: 'var(--color-chart-6)', width: 180 }
  )
];

/**
 * Drag a wire off one of `Noise`'s outputs and let go over empty canvas: the
 * graph raises `connectionDrop` with the release point and a full description of
 * the port, and this story turns that into a menu of node types that would
 * actually accept the wire.
 *
 * Note the filtering — dropping from `Value` (float) offers different entries
 * than dropping from `Colour`, because the menu is built from the same data type
 * the connection rules use. Dropping backwards off an *input* works too: the new
 * node becomes the source and the wire keeps its direction.
 */
export const CreateOnDrop: Story = {
  render: () => ({
    props: { nodes: DROP_NODES, catalog: CATALOG, types: SHADER_PORT_TYPES },
    template: `<xui-story-graph [nodes]="nodes" [catalog]="catalog" [portTypes]="types" />`
  })
};

/** Every routing mode over the same two nodes, so the difference is visible at a glance. */
export const Routing: Story = {
  render: () => ({
    props: { modes: ['bezier', 'orthogonal', 'smoothstep', 'straight'] as XuiGraphRouting[] },
    template: `
      <div class="grid grid-cols-2 gap-4">
        @for (mode of modes; track mode) {
          <div>
            <p class="text-foreground-muted mb-1 text-xs font-medium">{{ mode }}</p>
            <xui-node-graph
              class="border-border h-56 rounded-lg border"
              [routing]="mode"
              background="none"
              [edges]="[{ id: 'e', source: { nodeId: 'a', portId: 'out' }, target: { nodeId: 'b', portId: 'in' } }]"
            >
              <xui-graph-node nodeId="a" label="Source" [position]="{ x: 30, y: 30 }" [width]="120">
                <xui-graph-port portId="out" direction="output" label="Out" />
              </xui-graph-node>
              <xui-graph-node nodeId="b" label="Target" [position]="{ x: 200, y: 120 }" [width]="120">
                <xui-graph-port portId="in" direction="input" label="In" />
              </xui-graph-node>
            </xui-node-graph>
          </div>
        }
      </div>`
  })
};

/** The connector glyphs. `pin` reads as a component lead; the rest as data sockets. */
export const PortShapes: Story = {
  render: () => ({
    props: { shapes: ['circle', 'square', 'diamond', 'triangle', 'pin'] as XuiGraphPortShape[] },
    template: `
      <xui-node-graph class="border-border h-72 rounded-lg border" background="none">
        <xui-graph-node nodeId="shapes" label="Port shapes" [position]="{ x: 60, y: 40 }" [width]="200">
          @for (shape of shapes; track shape) {
            <xui-graph-port [portId]="shape" [label]="shape" direction="input" [shape]="shape" />
          }
        </xui-graph-node>
      </xui-node-graph>`
  })
};

/**
 * A port row is a normal flex row, so a control can live beside the connector —
 * the pattern every VFX and shader editor uses for unconnected inputs. Native
 * controls are exempt from node dragging automatically.
 */
export const InlineWidgets: Story = {
  render: () => ({
    template: `
      <xui-node-graph class="border-border h-80 rounded-lg border">
        <xui-graph-node nodeId="noise" label="Noise" accent="var(--color-chart-2)"
                        [position]="{ x: 80, y: 60 }" [width]="240">
          <xui-graph-node-preview class="bg-muted h-16" />

          <xui-graph-port portId="scale" direction="input" label="Scale">
            <input type="range" class="ml-auto w-20 accent-[var(--color-primary)]" />
          </xui-graph-port>

          <xui-graph-port portId="octaves" direction="input" label="Octaves">
            <input type="number" value="4"
                   class="border-border bg-surface-sunken ml-auto w-14 rounded border px-1 text-right text-xs" />
          </xui-graph-port>

          <xui-graph-port portId="seed" direction="input" label="Seed" />
          <xui-graph-port portId="out" direction="output" label="Value" />
        </xui-graph-node>
      </xui-node-graph>`
  })
};

/**
 * `portLayout="columns"` puts inputs and outputs side by side instead of
 * stacking them — the compact arrangement classic node editors use.
 */
export const ColumnLayout: Story = {
  render: () => ({
    props: { nodes: SHADER_NODES, edges: SHADER_EDGES, types: SHADER_PORT_TYPES },
    template: `<xui-story-graph [nodes]="nodes" [initialEdges]="edges" [portTypes]="types" portLayout="columns" />`
  })
};

/** Wires can carry a label, a flow animation, a dash pattern and an end marker. */
export const EdgeStyles: Story = {
  render: () => ({
    props: {
      edges: [
        { id: 'e1', source: { nodeId: 'a', portId: 'p1' }, target: { nodeId: 'b', portId: 'p1' }, label: 'labelled' },
        { id: 'e2', source: { nodeId: 'a', portId: 'p2' }, target: { nodeId: 'b', portId: 'p2' }, animated: true },
        { id: 'e3', source: { nodeId: 'a', portId: 'p3' }, target: { nodeId: 'b', portId: 'p3' }, dashed: true },
        {
          id: 'e4',
          source: { nodeId: 'a', portId: 'p4' },
          target: { nodeId: 'b', portId: 'p4' },
          marker: 'arrow-closed',
          color: 'var(--color-chart-5)',
          width: 3
        }
      ] as XuiGraphEdge[]
    },
    template: `
      <xui-node-graph class="border-border h-96 rounded-lg border" [edges]="edges">
        <xui-graph-node nodeId="a" label="Out" [position]="{ x: 60, y: 60 }" [width]="140">
          <xui-graph-port portId="p1" direction="output" label="label" />
          <xui-graph-port portId="p2" direction="output" label="animated" />
          <xui-graph-port portId="p3" direction="output" label="dashed" />
          <xui-graph-port portId="p4" direction="output" label="marker" />
        </xui-graph-node>
        <xui-graph-node nodeId="b" label="In" [position]="{ x: 420, y: 60 }" [width]="140">
          <xui-graph-port portId="p1" direction="input" />
          <xui-graph-port portId="p2" direction="input" />
          <xui-graph-port portId="p3" direction="input" />
          <xui-graph-port portId="p4" direction="input" />
        </xui-graph-node>
      </xui-node-graph>`
  })
};
