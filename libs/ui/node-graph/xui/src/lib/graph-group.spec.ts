import { render } from '@xui/testing';
import { XuiNodeGraphImports } from '../index';
import type { XuiGraphGroup } from './graph-group';
import type { XuiNodeGraph } from './node-graph';
import type { XuiGraphNodeMove, XuiGraphPoint } from './node-graph.types';

interface Props {
  moves: XuiGraphNodeMove[];
  /** Membership, so a test can move a node between frames the way a host would. */
  groupOf: Record<string, string | undefined>;
  positions: Record<string, XuiGraphPoint>;
}

/**
 * Two framed nodes and one loose one.
 *
 * Every node is 0×0 in jsdom, so a frame's box is its members' origins grown by
 * `padding` — small enough to reason about exactly.
 */
const GROUPED = `
  <xui-node-graph (nodeMove)="props().moves.push($event)">
    <xui-graph-group groupId="g1" label="Stage" [padding]="10" />

    <xui-graph-node nodeId="a" [group]="props().groupOf['a']" [position]="props().positions['a']" />
    <xui-graph-node nodeId="b" [group]="props().groupOf['b']" [position]="props().positions['b']" />
    <xui-graph-node nodeId="loose" [group]="props().groupOf['loose']" [position]="props().positions['loose']" />
  </xui-node-graph>`;

const setup = (template = GROUPED, props: Partial<Props> = {}) => {
  const result = render<Props>(template, {
    imports: [XuiNodeGraphImports],
    props: {
      moves: [],
      groupOf: { a: 'g1', b: 'g1', loose: undefined },
      positions: { a: { x: 100, y: 100 }, b: { x: 200, y: 160 }, loose: { x: 600, y: 600 } },
      ...props
    } as Props
  });
  const graph = result.fixture.debugElement.query(node => node.name === 'xui-node-graph')
    .componentInstance as XuiNodeGraph;
  const group = result.fixture.debugElement.query(node => node.name === 'xui-graph-group')?.componentInstance as
    XuiGraphGroup | undefined;

  return { ...result, graph, group, store: graph.store };
};

describe('XuiGraphGroup geometry', () => {
  it('frames its members, grown by the padding and the title bar', () => {
    const { store } = setup();

    // Members at (100,100) and (200,160), padding 10, 26px of title bar.
    expect(store.groupBounds('g1')).toEqual({ x: 90, y: 64, width: 120, height: 106 });
  });

  it('has no box at all while nothing belongs to it', () => {
    const { store } = setup(GROUPED, { groupOf: {} });

    expect(store.groupBounds('g1')).toBeNull();
  });

  it('reserves no title bar when the frame has no label', () => {
    const { store } = setup(
      `<xui-node-graph>
         <xui-graph-group groupId="g1" [padding]="10" />
         <xui-graph-node nodeId="a" group="g1" [position]="{ x: 100, y: 100 }" />
       </xui-node-graph>`
    );

    expect(store.groupBounds('g1')).toEqual({ x: 90, y: 90, width: 20, height: 20 });
  });

  it('follows its members as they move', () => {
    const { store, detect } = setup();

    store.node('a')?.moveTo({ x: 0, y: 0 });
    detect();

    expect(store.groupBounds('g1')).toMatchObject({ x: -10, y: -36 });
  });

  it('lists the nodes that claim membership', () => {
    const { group } = setup();

    expect(group?.members()).toEqual(['a', 'b']);
  });
});

describe('XuiGraphGroup dragging', () => {
  it('moves every member together', () => {
    const { store, detect } = setup();

    store.beginGroupDrag('g1');
    store.dragNodesBy({ x: 40, y: -20 });
    detect();

    expect(store.node('a')?.position()).toEqual({ x: 140, y: 80 });
    expect(store.node('b')?.position()).toEqual({ x: 240, y: 140 });
  });

  it('leaves non-members where they are', () => {
    const { store, detect } = setup();

    store.beginGroupDrag('g1');
    store.dragNodesBy({ x: 40, y: 40 });
    detect();

    expect(store.node('loose')?.position()).toEqual({ x: 600, y: 600 });
  });

  it('moves only the node itself when a member is dragged', () => {
    const { store, detect } = setup();

    store.beginNodeDrag('a');
    store.dragNodesBy({ x: 10, y: 10 });
    detect();

    expect(store.node('a')?.position()).toEqual({ x: 110, y: 110 });
    expect(store.node('b')?.position()).toEqual({ x: 200, y: 160 });
  });

  it('reports the drag as coming from the group and claims no membership change', () => {
    const { store, detect, fixture } = setup();

    store.beginGroupDrag('g1');
    store.dragNodesBy({ x: 5, y: 5 });
    store.endNodeDrag();
    detect();

    const move = fixture.componentInstance.props().moves.at(-1);

    expect(move?.source).toBe('group');
    // Carrying a frame around cannot change what is inside it.
    expect(move?.nodes.every(node => node.group === undefined)).toBe(true);
  });
});

describe('XuiGraphGroup membership hand-off', () => {
  it('reports the frame a node was dropped into', () => {
    const { store, fixture } = setup();

    store.beginNodeDrag('loose');
    store.dragNodesBy({ x: -450, y: -470 }); // (600,600) → (150,130), inside g1
    store.endNodeDrag();

    expect(fixture.componentInstance.props().moves.at(-1)?.nodes).toEqual([
      { nodeId: 'loose', position: { x: 150, y: 130 }, group: 'g1' }
    ]);
  });

  it('reports no frame for a node dropped on open canvas', () => {
    const { store, fixture } = setup();

    store.beginNodeDrag('loose');
    store.dragNodesBy({ x: 10, y: 10 });
    store.endNodeDrag();

    expect(fixture.componentInstance.props().moves.at(-1)?.nodes[0].group).toBeUndefined();
  });

  it('lets a member escape the frame it is already in', () => {
    const { store, fixture } = setup();

    // A frame grows to follow its own members, so measuring against the live box
    // would report the node as still inside wherever it was dragged.
    store.beginNodeDrag('a');
    store.dragNodesBy({ x: 500, y: 500 });
    store.endNodeDrag();

    expect(fixture.componentInstance.props().moves.at(-1)?.nodes[0].group).toBeUndefined();
  });

  it('keeps a member that only shuffled about inside its own frame', () => {
    const { store, fixture } = setup();

    // The frame is judged as it looked when the drag started — x 90…210,
    // y 64…170 — not as it looks with this node taken out of it.
    store.beginNodeDrag('a');
    store.dragNodesBy({ x: 60, y: 30 }); // → (160, 130)
    store.endNodeDrag();

    expect(fixture.componentInstance.props().moves.at(-1)?.nodes[0].group).toBe('g1');
  });

  it('adopts a node once the host reassigns it', () => {
    const { store, setProps, group } = setup();

    setProps({
      groupOf: { a: 'g1', b: 'g1', loose: 'g1' },
      positions: { a: { x: 100, y: 100 }, b: { x: 200, y: 160 }, loose: { x: 150, y: 130 } }
    });

    expect(group?.members()).toEqual(['a', 'b', 'loose']);
    expect(store.groupBounds('g1')).toEqual({ x: 90, y: 64, width: 120, height: 106 });
  });

  it('picks the innermost frame when two overlap', () => {
    const { store, fixture } = setup(
      `<xui-node-graph (nodeMove)="props().moves.push($event)">
         <xui-graph-group groupId="outer" [padding]="200" />
         <xui-graph-group groupId="inner" [padding]="20" />
         <xui-graph-node nodeId="o" group="outer" [position]="{ x: 100, y: 100 }" />
         <xui-graph-node nodeId="i" group="inner" [position]="{ x: 100, y: 100 }" />
         <xui-graph-node nodeId="loose" [position]="{ x: 600, y: 600 }" />
       </xui-node-graph>`
    );

    store.beginNodeDrag('loose');
    store.dragNodesBy({ x: -490, y: -490 }); // → (110,110), inside both frames
    store.endNodeDrag();

    expect(fixture.componentInstance.props().moves.at(-1)?.nodes[0].group).toBe('inner');
  });
});
