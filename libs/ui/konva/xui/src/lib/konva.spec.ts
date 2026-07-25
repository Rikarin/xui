import { By } from '@angular/platform-browser';
import { render, type RenderResult } from '@xui/testing';
import { Layer } from 'konva/lib/Layer';
import { Rect } from 'konva/lib/shapes/Rect';
import { Stage } from 'konva/lib/Stage';
import { XuiKonvaImports, XuiKonvaShape, XuiKonvaStage, getNodeName, type XuiKonvaEventObject } from '../index';

const IMPORTS = [XuiKonvaImports];

const SCENE = `
  <xui-konva-stage [config]="{ width: 300, height: 200 }">
    <xui-konva-layer>
      <xui-konva-rect [config]="{ name: 'a', width: 10, height: 10 }" />
      <xui-konva-rect [config]="{ name: 'b', width: 10, height: 10 }" />
    </xui-konva-layer>
  </xui-konva-stage>
`;

/** The wrapper instance behind the first element matching `selector`. */
const instance = <T>({ fixture }: RenderResult<never>, selector: string): T =>
  fixture.debugElement.query(By.css(selector)).componentInstance;

const stageOf = (result: RenderResult<never>) => instance<XuiKonvaStage>(result, 'xui-konva-stage').getNode();
const layerOf = (result: RenderResult<never>) => instance<XuiKonvaShape>(result, 'xui-konva-layer').getNode() as Layer;

/** MutationObserver callbacks land in a microtask; a macrotask is safely after. */
const flush = () => new Promise(resolve => setTimeout(resolve, 0));

describe('XuiKonvaStage', () => {
  it('builds a Konva stage sized from the config', () => {
    const result = render(SCENE, { imports: IMPORTS });
    const stage = stageOf(result);

    expect(stage).toBeInstanceOf(Stage);
    expect(stage.width()).toBe(300);
    expect(stage.height()).toBe(200);
  });

  it('draws into a container of its own so projected content survives', () => {
    const result = render(SCENE, { imports: IMPORTS });
    const host = result.query('xui-konva-stage');

    expect(host.querySelector('canvas')).toBeTruthy();
    expect(host.querySelector('xui-konva-layer')).toBeTruthy();
    // Konva empties whatever element it is handed, so it must not get the host.
    expect(stageOf(result).container()).not.toBe(host);
  });

  it('applies config changes to the existing stage rather than rebuilding it', () => {
    const result = render<{ width: number }>(
      `<xui-konva-stage [config]="{ width: props().width, height: 200 }"><xui-konva-layer /></xui-konva-stage>`,
      { imports: IMPORTS, props: { width: 300 } }
    );
    const stage = stageOf(result as RenderResult<never>);

    result.setProps({ width: 400 });

    expect(stageOf(result as RenderResult<never>)).toBe(stage);
    expect(stage.width()).toBe(400);
  });

  it('refuses anything but a layer as a direct child', () => {
    const result = render(SCENE, { imports: IMPORTS });
    const stage = instance<XuiKonvaStage>(result, 'xui-konva-stage');
    const orphan = { getStage: () => new Rect(), hostElement: document.createElement('div') };

    expect(() => stage.addChild(orphan)).toThrow(/only layers/);
  });

  it('destroys the Konva stage with the component', () => {
    const result = render(SCENE, { imports: IMPORTS });
    const stage = stageOf(result);

    result.fixture.destroy();

    expect(stage.isClientRectOnScreen).toBeDefined();
    expect(stage.getLayers()).toHaveLength(0);
  });
});

describe('XuiKonvaShape', () => {
  it('builds the Konva node its tag names', () => {
    const result = render(SCENE, { imports: IMPORTS });

    expect(layerOf(result)).toBeInstanceOf(Layer);
    expect(instance<XuiKonvaShape>(result, 'xui-konva-rect').getNode()).toBeInstanceOf(Rect);
  });

  it('nests nodes the way the template nests elements', () => {
    const result = render(SCENE, { imports: IMPORTS });
    const layer = layerOf(result);

    expect(stageOf(result).getLayers()).toEqual([layer]);
    expect(layer.getChildren().map(child => child.name())).toEqual(['a', 'b']);
  });

  it('registers through DI, so wrappers may sit in between', () => {
    const result = render(
      `
        <xui-konva-stage [config]="{ width: 300, height: 200 }">
          <xui-konva-layer>
            <xui-konva-group>
              <xui-konva-circle [config]="{ name: 'inner', radius: 5 }" />
            </xui-konva-group>
          </xui-konva-layer>
        </xui-konva-stage>
      `,
      { imports: IMPORTS }
    );

    expect(layerOf(result).findOne('.inner')).toBeTruthy();
  });

  it('applies config updates to the node it already built', () => {
    const result = render<{ fill: string }>(
      `
        <xui-konva-stage [config]="{ width: 300, height: 200 }">
          <xui-konva-layer>
            <xui-konva-rect [config]="{ fill: props().fill, width: 10, height: 10 }" />
          </xui-konva-layer>
        </xui-konva-stage>
      `,
      { imports: IMPORTS, props: { fill: 'red' } }
    );
    const rect = instance<XuiKonvaShape>(result as RenderResult<never>, 'xui-konva-rect').getNode();

    expect(rect.getAttr('fill')).toBe('red');

    result.setProps({ fill: 'blue' });

    expect(rect.getAttr('fill')).toBe('blue');
  });

  it('takes its node out of the scene when the element goes away', () => {
    const result = render<{ show: boolean }>(
      `
        <xui-konva-stage [config]="{ width: 300, height: 200 }">
          <xui-konva-layer>
            @if (props().show) {
              <xui-konva-rect [config]="{ name: 'a', width: 10, height: 10 }" />
            }
            <xui-konva-rect [config]="{ name: 'b', width: 10, height: 10 }" />
          </xui-konva-layer>
        </xui-konva-stage>
      `,
      { imports: IMPORTS, props: { show: true } }
    );
    const layer = layerOf(result as RenderResult<never>);

    expect(layer.getChildren()).toHaveLength(2);

    result.setProps({ show: false });

    expect(layer.getChildren().map(child => child.name())).toEqual(['b']);
  });

  it('follows the DOM when @for reorders its children', async () => {
    const result = render<{ names: string[] }>(
      `
        <xui-konva-stage [config]="{ width: 300, height: 200 }">
          <xui-konva-layer>
            @for (name of props().names; track name) {
              <xui-konva-rect [config]="{ name: name, width: 10, height: 10 }" />
            }
          </xui-konva-layer>
        </xui-konva-stage>
      `,
      { imports: IMPORTS, props: { names: ['a', 'b', 'c'] } }
    );
    const layer = layerOf(result as RenderResult<never>);

    await flush();
    expect(layer.getChildren().map(child => child.name())).toEqual(['a', 'b', 'c']);

    result.setProps({ names: ['c', 'a', 'b'] });
    await flush();

    expect(layer.getChildren().map(child => child.name())).toEqual(['c', 'a', 'b']);
  });
});

describe('XuiKonva events', () => {
  it('emits the Konva event along with the wrapper that raised it', () => {
    const events: XuiKonvaEventObject<MouseEvent>[] = [];
    const result = render<{ onClick: (event: XuiKonvaEventObject<MouseEvent>) => void }>(
      `
        <xui-konva-stage [config]="{ width: 300, height: 200 }">
          <xui-konva-layer>
            <xui-konva-rect [config]="{ width: 10, height: 10 }" (click)="props().onClick($event)" />
          </xui-konva-layer>
        </xui-konva-stage>
      `,
      { imports: IMPORTS, props: { onClick: event => events.push(event) } }
    );
    const rect = instance<XuiKonvaShape>(result as RenderResult<never>, 'xui-konva-rect');

    rect.getNode().fire('click');

    expect(events).toHaveLength(1);
    expect(events[0].component).toBe(rect);
    expect(events[0].event.target).toBe(rect.getNode());
  });

  it('leaves events nothing is listening to unbound', () => {
    const result = render(SCENE, { imports: IMPORTS });
    const rect = instance<XuiKonvaShape>(result, 'xui-konva-rect').getNode();

    expect(rect.eventListeners['click']).toBeUndefined();
  });
});

describe('getNodeName', () => {
  it.each([
    ['xui-konva-rect', 'Rect'],
    ['xui-konva-text-path', 'TextPath'],
    ['xui-konva-regular-polygon', 'RegularPolygon'],
    ['xui-konva-fast-layer', 'FastLayer']
  ])('maps %s to Konva.%s', (tag, expected) => {
    expect(getNodeName(tag)).toBe(expected);
  });
});
