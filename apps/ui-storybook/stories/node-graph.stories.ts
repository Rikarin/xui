import { ChangeDetectionStrategy, Component, computed, input, signal, type WritableSignal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import {
  XuiNodeGraph,
  XuiNodeGraphImports,
  type XuiGraphConnection,
  type XuiGraphEdge,
  type XuiGraphPoint,
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
  ports: DemoPort[];
}

const node = (id: string, label: string, x: number, y: number, ports: DemoPort[], extra: Partial<DemoNode> = {}) =>
  ({ id, label, position: signal({ x, y }), ports, ...extra }) satisfies DemoNode;

/** A shader-style palette: one colour per data type, taken from the chart ramp. */
const SHADER_PORT_TYPES = {
  float: { color: 'var(--color-chart-3)', label: 'Float' },
  vector: { color: 'var(--color-chart-1)', label: 'Vector' },
  color: { color: 'var(--color-chart-4)', label: 'Colour' },
  texture: { color: 'var(--color-chart-7)', label: 'Texture' }
};

/**
 * The shared editing behaviour every demo needs: hold the edges, accept
 * approved connections, drop the selection on Delete.
 */
@Component({
  selector: 'xui-story-graph',
  imports: [XuiNodeGraphImports],
  template: `
    <xui-node-graph
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
      (deleteSelection)="onDelete($event)"
    >
      @for (item of nodes(); track item.id) {
        <xui-graph-node
          [nodeId]="item.id"
          [label]="item.label"
          [accent]="item.accent"
          [width]="item.width"
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

      <xui-graph-controls />
      <xui-graph-minimap />
    </xui-node-graph>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class StoryGraph {
  readonly nodes = input.required<DemoNode[]>();
  readonly initialEdges = input<XuiGraphEdge[]>([]);
  readonly routing = input<XuiGraphRouting>('bezier');
  readonly background = input<'none' | 'dots' | 'grid'>('dots');
  readonly gridSize = input(16);
  readonly snapToGrid = input(false);
  readonly portTypes = input<Record<string, { color: string; label?: string }>>({});
  readonly portShape = input<XuiGraphPortShape>('circle');
  readonly portLayout = input<'stacked' | 'columns'>('stacked');
  readonly marker = input<'none' | 'arrow' | 'arrow-closed' | 'dot'>('none');
  readonly collapsible = input(false);

  private readonly added = signal<XuiGraphEdge[]>([]);
  private readonly removed = signal<ReadonlySet<string>>(new Set());

  protected readonly edges = computed(() =>
    [...this.initialEdges(), ...this.added()].filter(edge => !this.removed().has(edge.id))
  );

  protected onConnect(connection: XuiGraphConnection): void {
    const id = `${connection.source.nodeId}.${connection.source.portId}->${connection.target.nodeId}.${connection.target.portId}`;

    this.added.update(edges => [...edges, { id, ...connection }]);
  }

  protected onDelete({ edges }: { nodes: string[]; edges: string[] }): void {
    this.removed.update(current => new Set([...current, ...edges]));
  }
}

const meta: Meta<XuiNodeGraph> = {
  title: 'Node Graph',
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

/** Every routing mode over the same two nodes, so the difference is visible at a glance. */
export const Routing: Story = {
  render: () => ({
    props: {
      modes: ['bezier', 'orthogonal', 'smoothstep', 'straight'] as XuiGraphRouting[],
      positions: {
        a: signal({ x: 30, y: 30 }),
        b: signal({ x: 210, y: 130 })
      }
    },
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
          <div xuiGraphNodePreview class="bg-muted h-16"></div>

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
