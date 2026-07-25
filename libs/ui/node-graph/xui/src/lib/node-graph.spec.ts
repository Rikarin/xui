import { render, type RenderResult } from '@xui/testing';
import { XuiNodeGraphImports } from '../index';
import type { XuiNodeGraph } from './node-graph';
import type {
  XuiGraphConnection,
  XuiGraphConnectionDrop,
  XuiGraphConnectionValidator,
  XuiGraphEdge
} from './node-graph.types';
import { xuiGraphPortKey } from './node-graph.types';

interface Props {
  edges: XuiGraphEdge[];
  connected: XuiGraphConnection[];
  drops: XuiGraphConnectionDrop[];
  validator?: XuiGraphConnectionValidator;
}

/**
 * Two nodes with one output and one input each — the smallest graph that can be
 * wired at all, which is what most of these tests need.
 */
const PAIR = `
  <xui-node-graph
    [edges]="props().edges"
    (connect)="props().connected.push($event)"
    (connectionDrop)="props().drops.push($event)"
  >
    <xui-graph-node nodeId="a" [position]="{ x: 0, y: 0 }">
      <xui-graph-port portId="out" direction="output" dataType="float" />
    </xui-graph-node>
    <xui-graph-node nodeId="b" [position]="{ x: 300, y: 0 }">
      <xui-graph-port portId="in" direction="input" dataType="float" />
      <xui-graph-port portId="colour" direction="input" dataType="color" />
    </xui-graph-node>
  </xui-node-graph>`;

const setup = (template = PAIR, props: Partial<Props> = {}) => {
  const result = render<Props>(template, {
    imports: [XuiNodeGraphImports],
    props: { edges: [], connected: [], drops: [], ...props } as Props
  });
  const graph = result.fixture.debugElement.query(node => node.name === 'xui-node-graph')
    .componentInstance as XuiNodeGraph;

  return { ...result, graph, store: graph.store };
};

const OUT = xuiGraphPortKey('a', 'out');
const IN = xuiGraphPortKey('b', 'in');
const COLOUR = xuiGraphPortKey('b', 'colour');

const connection = (source = { nodeId: 'a', portId: 'out' }, target = { nodeId: 'b', portId: 'in' }) => ({
  source,
  target
});

describe('XuiNodeGraph registry', () => {
  it('registers every node and port inside the canvas', () => {
    const { store } = setup();

    expect(store.nodes().map(node => node.nodeId())).toEqual(['a', 'b']);
    expect(store.ports().map(port => port.key)).toEqual([OUT, IN, COLOUR]);
  });

  it('unregisters a node when it leaves the template', () => {
    const { store, setProps } = setup(
      `<xui-node-graph>
         <xui-graph-node nodeId="a" [position]="{ x: 0, y: 0 }"></xui-graph-node>
         @if (props().edges.length === 0) {
           <xui-graph-node nodeId="b" [position]="{ x: 0, y: 0 }"></xui-graph-node>
         }
       </xui-node-graph>`,
      { edges: [] }
    );

    expect(store.nodes()).toHaveLength(2);

    setProps({ edges: [{ id: 'e', source: connection().source, target: connection().target }] });

    expect(store.nodes().map(node => node.nodeId())).toEqual(['a']);
  });

  it('derives a port position from its node, so moving the node moves the wire', () => {
    const { store, detect } = setup();

    expect(store.portPoint(OUT)).toEqual({ x: 0, y: 0 });

    store.node('a')?.moveTo({ x: 40, y: 25 });
    detect();

    expect(store.portPoint(OUT)).toEqual({ x: 40, y: 25 });
  });

  it('counts the edges terminating at each port', () => {
    const { store } = setup(PAIR, { edges: [{ id: 'e1', ...connection() }] });

    expect(store.connectionCount(OUT)).toBe(1);
    expect(store.connectionCount(IN)).toBe(1);
    expect(store.connectionCount(COLOUR)).toBe(0);
  });
});

describe('XuiNodeGraph connection rules', () => {
  it('accepts an output wired to a compatible input', () => {
    const { store } = setup();

    expect(store.canConnect(connection())).toBe(true);
  });

  it('rejects a wire that runs backwards out of an input', () => {
    const { store } = setup();

    expect(store.canConnect(connection({ nodeId: 'b', portId: 'in' }, { nodeId: 'a', portId: 'out' }))).toBe(false);
  });

  it('rejects mismatched data types', () => {
    const { store } = setup();

    expect(store.canConnect(connection(undefined, { nodeId: 'b', portId: 'colour' }))).toBe(false);
  });

  it('allows a mismatch once type enforcement is off', () => {
    const { store } = setup(PAIR.replace('<xui-node-graph', '<xui-node-graph [enforcePortTypes]="false"'));

    expect(store.canConnect(connection(undefined, { nodeId: 'b', portId: 'colour' }))).toBe(true);
  });

  it('rejects a second wire into an input, which takes one by default', () => {
    const { store } = setup(PAIR, { edges: [{ id: 'e1', ...connection() }] });

    expect(store.canConnect(connection())).toBe(false);
  });

  it('lets an output fan out to several inputs', () => {
    const { store } = setup(
      `<xui-node-graph [edges]="props().edges">
         <xui-graph-node nodeId="a" [position]="{ x: 0, y: 0 }">
           <xui-graph-port portId="out" direction="output" />
         </xui-graph-node>
         <xui-graph-node nodeId="b" [position]="{ x: 0, y: 0 }">
           <xui-graph-port portId="in" direction="input" />
         </xui-graph-node>
         <xui-graph-node nodeId="c" [position]="{ x: 0, y: 0 }">
           <xui-graph-port portId="in" direction="input" />
         </xui-graph-node>
       </xui-node-graph>`,
      { edges: [{ id: 'e1', ...connection() }] }
    );

    expect(store.canConnect(connection(undefined, { nodeId: 'c', portId: 'in' }))).toBe(true);
  });

  it('rejects a duplicate of an edge that already exists', () => {
    const { store } = setup(
      `<xui-node-graph [edges]="props().edges" [allowSelfConnection]="true">
         <xui-graph-node nodeId="a" [position]="{ x: 0, y: 0 }">
           <xui-graph-port portId="out" direction="output" />
           <xui-graph-port portId="in" direction="input" [maxConnections]="5" />
         </xui-graph-node>
       </xui-node-graph>`,
      { edges: [{ id: 'e1', ...connection({ nodeId: 'a', portId: 'out' }, { nodeId: 'a', portId: 'in' }) }] }
    );

    expect(store.canConnect(connection({ nodeId: 'a', portId: 'out' }, { nodeId: 'a', portId: 'in' }))).toBe(false);
  });

  it('rejects a self-connection unless it is allowed', () => {
    const selfGraph = (allow: boolean) =>
      `<xui-node-graph [allowSelfConnection]="${allow}">
         <xui-graph-node nodeId="a" [position]="{ x: 0, y: 0 }">
           <xui-graph-port portId="out" direction="output" />
           <xui-graph-port portId="in" direction="input" />
         </xui-graph-node>
       </xui-node-graph>`;
    const self = connection({ nodeId: 'a', portId: 'out' }, { nodeId: 'a', portId: 'in' });

    expect(setup(selfGraph(false)).store.canConnect(self)).toBe(false);
    expect(setup(selfGraph(true)).store.canConnect(self)).toBe(true);
  });

  it('wires an inout terminal from either end', () => {
    const { store } = setup(
      `<xui-node-graph>
         <xui-graph-node nodeId="a" [position]="{ x: 0, y: 0 }">
           <xui-graph-port portId="p1" direction="inout" />
         </xui-graph-node>
         <xui-graph-node nodeId="b" [position]="{ x: 0, y: 0 }">
           <xui-graph-port portId="p2" direction="inout" />
         </xui-graph-node>
       </xui-node-graph>`
    );

    const forward = connection({ nodeId: 'a', portId: 'p1' }, { nodeId: 'b', portId: 'p2' });

    expect(store.canConnect(forward)).toBe(true);
    expect(store.canConnect(connection(forward.target, forward.source))).toBe(true);
  });

  it('gives a host validator the last word over the built-in rules', () => {
    const { store } = setup(
      PAIR.replace('<xui-node-graph', '<xui-node-graph [isValidConnection]="props().validator"'),
      {
        validator: ({ target }) => target.portId !== 'in'
      }
    );

    expect(store.canConnect(connection())).toBe(false);
    // The validator only narrows: a pairing the built-in rules already rejected
    // stays rejected however permissive it is.
    expect(store.canConnect(connection(undefined, { nodeId: 'b', portId: 'colour' }))).toBe(false);
  });

  it('refuses every connection while the canvas is locked', () => {
    const { store } = setup(PAIR.replace('<xui-node-graph', '<xui-node-graph locked'));

    expect(store.canConnect(connection())).toBe(false);
  });
});

describe('XuiNodeGraph linking', () => {
  it('reports a connection when a wire is dropped on a legal port', () => {
    const { store, fixture } = setup();
    const connected = fixture.componentInstance.props().connected;

    store.beginLink(store.port(OUT)!, { x: 0, y: 0 });
    store.endLink(IN);

    expect(connected).toEqual([connection()]);
  });

  it('reverses a wire dragged backwards out of an input', () => {
    const { store, fixture } = setup();
    const connected = fixture.componentInstance.props().connected;

    store.beginLink(store.port(IN)!, { x: 0, y: 0 });
    store.endLink(OUT);

    expect(connected).toEqual([connection()]);
  });

  it('reports nothing when a wire is dropped on an incompatible port', () => {
    const { store, fixture } = setup();
    const connected = fixture.componentInstance.props().connected;

    store.beginLink(store.port(OUT)!, { x: 0, y: 0 });
    store.endLink(COLOUR);

    expect(connected).toEqual([]);
  });

  it('describes the source port when a wire lands on empty canvas', () => {
    const { store, fixture } = setup();

    store.beginLink(store.port(OUT)!, { x: 0, y: 0 });
    store.moveLink({ x: 120, y: 90 });
    store.endLink(null);

    // The whole descriptor travels with the drop so a create menu can filter
    // itself to what would actually connect, without a second lookup.
    expect(fixture.componentInstance.props().drops).toEqual([
      {
        source: { nodeId: 'a', portId: 'out' },
        port: {
          nodeId: 'a',
          portId: 'out',
          direction: 'output',
          side: 'right',
          dataType: 'float',
          maxConnections: Infinity,
          disabled: false,
          connections: 0
        },
        position: { x: 120, y: 90 },
        surfacePosition: { x: 120, y: 90 }
      }
    ]);
  });

  it('reports the drop point in surface coordinates through the viewport', () => {
    const { store, fixture } = setup();

    store.zoomTo(2);
    store.panBy(30, 10);
    store.beginLink(store.port(OUT)!, { x: 0, y: 0 });
    store.moveLink({ x: 50, y: 25 });
    store.endLink(null);

    expect(fixture.componentInstance.props().drops.at(-1)?.surfacePosition).toEqual({ x: 130, y: 60 });
  });

  it('reports nothing when the wire lands on a port, even an illegal one', () => {
    const { store, fixture } = setup();

    store.beginLink(store.port(OUT)!, { x: 0, y: 0 });
    store.endLink(COLOUR);

    expect(fixture.componentInstance.props().drops).toEqual([]);
  });

  it('marks each port valid or invalid while a wire is in flight', () => {
    const { store } = setup();

    store.beginLink(store.port(OUT)!, { x: 0, y: 0 });

    expect(store.linkState(OUT)).toBe('source');
    expect(store.linkState(IN)).toBe('valid');
    expect(store.linkState(COLOUR)).toBe('invalid');

    store.endLink(null);

    expect(store.linkState(IN)).toBe('idle');
  });
});

describe('XuiNodeGraph selection and movement', () => {
  it('replaces the selection on a plain click and extends it on an additive one', () => {
    const { store } = setup();

    store.selectNode('a');
    expect([...store.selectedNodes()]).toEqual(['a']);

    store.selectNode('b');
    expect([...store.selectedNodes()]).toEqual(['b']);

    store.selectNode('a', true);
    expect([...store.selectedNodes()].sort()).toEqual(['a', 'b']);
  });

  it('selects the nodes a marquee overlaps', () => {
    const { store } = setup();

    // Both nodes measure 0×0 in jsdom, so the rect must contain their origins.
    store.selectInRect({ x: -10, y: -10, width: 20, height: 20 });

    expect([...store.selectedNodes()]).toEqual(['a']);
  });

  it('moves the whole selection with the node being dragged', () => {
    const { store, detect } = setup();

    store.setSelection(['a', 'b']);
    store.beginNodeDrag('a');
    store.dragNodesBy({ x: 15, y: -5 });
    detect();

    expect(store.node('a')?.position()).toEqual({ x: 15, y: -5 });
    expect(store.node('b')?.position()).toEqual({ x: 315, y: -5 });
  });

  it('leaves an unselected node behind when another one is dragged', () => {
    const { store, detect } = setup();

    store.setSelection(['b']);
    store.beginNodeDrag('a');
    store.dragNodesBy({ x: 10, y: 10 });
    detect();

    expect(store.node('a')?.position()).toEqual({ x: 10, y: 10 });
    expect(store.node('b')?.position()).toEqual({ x: 300, y: 0 });
  });

  it('snaps a dragged node to the grid without accumulating drift', () => {
    const { store, detect } = setup(PAIR.replace('<xui-node-graph', '<xui-node-graph snapToGrid [gridSize]="20"'));

    store.beginNodeDrag('a');
    store.dragNodesBy({ x: 9, y: 11 });
    store.dragNodesBy({ x: 31, y: 11 });
    detect();

    // Offsets apply to the captured origin, so the second drag lands on 40, not
    // on 20 + 31 rounded.
    expect(store.node('a')?.position()).toEqual({ x: 40, y: 20 });
  });

  it('does not move a locked node', () => {
    const { store, detect } = setup(
      `<xui-node-graph>
         <xui-graph-node nodeId="a" locked [position]="{ x: 5, y: 5 }"></xui-graph-node>
       </xui-node-graph>`
    );

    store.beginNodeDrag('a');
    store.dragNodesBy({ x: 50, y: 50 });
    detect();

    expect(store.node('a')?.position()).toEqual({ x: 5, y: 5 });
  });
});

describe('XuiNodeGraph viewport', () => {
  it('holds the anchor point still while zooming', () => {
    const { store } = setup();

    store.surfaceSize.set({ width: 400, height: 300 });
    store.panBy(25, -15);

    const before = store.toGraphPoint(100, 50);
    store.zoomTo(2, { x: 100, y: 50 });

    expect(store.viewport().zoom).toBe(2);
    // Whatever sat under the cursor must still sit under it afterwards.
    expect(store.toGraphPoint(100, 50)).toEqual(before);
  });

  it('clamps zoom to the configured bounds', () => {
    const { store } = setup(PAIR.replace('<xui-node-graph', '<xui-node-graph [minZoom]="0.5" [maxZoom]="1.5"'));

    store.zoomTo(10);
    expect(store.viewport().zoom).toBe(1.5);

    store.zoomTo(0.01);
    expect(store.viewport().zoom).toBe(0.5);
  });

  it('converts between screen and graph space through the viewport', () => {
    const { store } = setup();

    store.zoomTo(2);
    store.panBy(30, 10);

    const graph = store.toGraphPoint(130, 110);

    expect(store.toSurfacePoint(graph)).toEqual({ x: 130, y: 110 });
  });
});

describe('XuiNodeGraph rendering', () => {
  const paths = (result: RenderResult<Props>) =>
    result.queryAll<SVGPathElement>('svg path').filter(path => path.getAttribute('stroke') !== 'transparent');

  it('draws one wire per edge', () => {
    const result = setup(PAIR, { edges: [{ id: 'e1', ...connection() }] });

    expect(result.graph['renderedEdges']()).toHaveLength(1);
    // Markers in `defs` also hold paths, so only stroked wires are counted.
    expect(paths(result).length).toBeGreaterThan(0);
  });

  it('skips an edge naming a port that has not rendered', () => {
    const before = setup(PAIR, { edges: [] });
    const drawn = before.graph['renderedEdges']().length;

    expect(drawn).toBe(0);

    const after = setup(PAIR, {
      edges: [{ id: 'ghost', ...connection({ nodeId: 'a', portId: 'nope' }, { nodeId: 'b', portId: 'in' }) }]
    });

    expect(after.graph['renderedEdges']()).toHaveLength(0);
  });

  it('keeps a collapsed node wired up', () => {
    const { store } = setup(
      `<xui-node-graph>
         <xui-graph-node nodeId="a" collapsible [collapsed]="true" [position]="{ x: 0, y: 0 }">
           <xui-graph-port portId="out" direction="output" />
         </xui-graph-node>
       </xui-node-graph>`
    );

    expect(store.port(OUT)).toBeDefined();
  });

  it('colours a wire from its source port', () => {
    const result = setup(
      `<xui-node-graph [edges]="props().edges" [portTypes]="{ float: { color: 'rebeccapurple' } }">
         <xui-graph-node nodeId="a" [position]="{ x: 0, y: 0 }">
           <xui-graph-port portId="out" direction="output" dataType="float" />
         </xui-graph-node>
         <xui-graph-node nodeId="b" [position]="{ x: 0, y: 0 }">
           <xui-graph-port portId="in" direction="input" dataType="float" />
         </xui-graph-node>
       </xui-node-graph>`,
      { edges: [{ id: 'e1', ...connection() }] }
    );

    expect(result.graph['renderedEdges']()[0].color).toBe('rebeccapurple');
  });

  it('lets an edge override the routing of the graph', () => {
    const result = setup(PAIR, { edges: [{ id: 'e1', ...connection(), routing: 'straight' }] });

    expect(result.graph['renderedEdges']()[0].d).toBe('M 0 0 L 300 0');
  });
});
