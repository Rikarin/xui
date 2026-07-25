import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiKonvaImports, XuiKonvaStage, type XuiKonvaEventObject } from '@xui/konva';
import type { Circle } from 'konva/lib/shapes/Circle';

/**
 * Konva scenes written as Angular templates. `<xui-konva-stage>` is the canvas,
 * `<xui-konva-layer>` a drawing surface on it, and every other tag — rect,
 * circle, star, text … — a node inside. Everything Konva accepts goes through
 * `config`; every Konva event is an Angular output.
 */
const meta: Meta<XuiKonvaStage> = {
  title: 'Visualisation/Konva',
  component: XuiKonvaStage,
  decorators: [moduleMetadata({ imports: [XuiKonvaImports] })]
};

export default meta;
type Story = StoryObj<XuiKonvaStage>;

const STAGE = { width: 520, height: 240 };

export const Shapes: Story = {
  render: () => ({
    props: {
      stageConfig: STAGE,
      rect: { x: 20, y: 40, width: 120, height: 80, fill: '#1f75cb', cornerRadius: 8 },
      circle: { x: 220, y: 80, radius: 45, fill: '#ed1c46' },
      star: { x: 360, y: 80, numPoints: 5, innerRadius: 22, outerRadius: 45, fill: '#f5a623' },
      line: { points: [20, 170, 480, 170], stroke: '#8b949e', strokeWidth: 2, dash: [8, 6] },
      text: { x: 20, y: 190, text: 'Every tag is a Konva node', fontSize: 18, fill: '#8b949e' }
    },
    template: `
      <xui-konva-stage [config]="stageConfig" class="border-border inline-block rounded-lg border">
        <xui-konva-layer>
          <xui-konva-rect [config]="rect" />
          <xui-konva-circle [config]="circle" />
          <xui-konva-star [config]="star" />
          <xui-konva-line [config]="line" />
          <xui-konva-text [config]="text" />
        </xui-konva-layer>
      </xui-konva-stage>
    `
  })
};

/**
 * Bind Konva events like any other output. The payload carries the Konva event
 * and the wrapper that raised it, so `getNode()` is one hop away.
 */
export const Events: Story = {
  render: () => ({
    props: {
      stageConfig: STAGE,
      swatches: [
        { x: 40, y: 80, radius: 40, fill: '#1f75cb' },
        { x: 160, y: 80, radius: 40, fill: '#ed1c46' },
        { x: 280, y: 80, radius: 40, fill: '#f5a623' }
      ],
      hint: { x: 40, y: 180, text: 'Click a circle', fontSize: 16, fill: '#8b949e' },
      onClick: (event: XuiKonvaEventObject<MouseEvent>) => {
        const node = event.component.getNode() as Circle;

        node.radius(node.radius() === 40 ? 55 : 40);
      }
    },
    template: `
      <xui-konva-stage [config]="stageConfig" class="border-border inline-block rounded-lg border">
        <xui-konva-layer>
          @for (swatch of swatches; track swatch.fill) {
            <xui-konva-circle [config]="swatch" (click)="onClick($event)" />
          }
          <xui-konva-text [config]="hint" />
        </xui-konva-layer>
      </xui-konva-stage>
    `
  })
};

/**
 * `draggable` is a Konva config flag, and the drag events come back as outputs.
 * Groups move their children with them.
 */
export const Draggable: Story = {
  render: () => ({
    props: {
      stageConfig: STAGE,
      group: { x: 60, y: 50, draggable: true },
      card: { width: 160, height: 100, fill: '#1f75cb', cornerRadius: 8 },
      label: { x: 16, y: 40, text: 'Drag me', fontSize: 20, fill: '#fff' },
      onDragEnd: (event: XuiKonvaEventObject<MouseEvent>) => {
        const node = event.component.getNode();

        console.info('dropped at', node.x(), node.y());
      }
    },
    template: `
      <xui-konva-stage [config]="stageConfig" class="border-border inline-block rounded-lg border">
        <xui-konva-layer>
          <xui-konva-group [config]="group" (dragend)="onDragEnd($event)">
            <xui-konva-rect [config]="card" />
            <xui-konva-text [config]="label" />
          </xui-konva-group>
        </xui-konva-layer>
      </xui-konva-stage>
    `
  })
};

/**
 * Stacking order follows the template: later siblings draw on top, and a `@for`
 * reorder is mirrored onto the Konva z-indices.
 */
export const Stacking: Story = {
  render: () => ({
    props: {
      stageConfig: STAGE,
      cards: [
        { x: 60, y: 60, width: 140, height: 100, fill: '#1f75cb', cornerRadius: 8 },
        { x: 120, y: 90, width: 140, height: 100, fill: '#ed1c46', cornerRadius: 8 },
        { x: 180, y: 120, width: 140, height: 100, fill: '#f5a623', cornerRadius: 8 }
      ]
    },
    template: `
      <xui-konva-stage [config]="stageConfig" class="border-border inline-block rounded-lg border">
        <xui-konva-layer>
          @for (card of cards; track card.fill) {
            <xui-konva-rect [config]="card" />
          }
        </xui-konva-layer>
      </xui-konva-stage>
    `
  })
};
