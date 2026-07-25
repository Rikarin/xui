import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  model,
  output
} from '@angular/core';
import Konva from 'konva';
import { Container } from 'konva/lib/Container';
import type { Node, NodeConfig } from 'konva/lib/Node';
import type { Shape } from 'konva/lib/Shape';
import { XUI_KONVA_CONTAINER, type XuiKonvaChild, type XuiKonvaContainer } from './konva.token';
import { XuiKonvaComponent, type XuiKonvaEventObject } from './konva.types';
import { applyNodeProps, createListener, getNodeName, updatePicture, type XuiKonvaProps } from './konva.utils';

/**
 * Every Konva node other than the stage, behind one component.
 *
 * The tag decides the node: `<xui-konva-circle>` builds a `Konva.Circle`,
 * `<xui-konva-layer>` a `Konva.Layer`, and so on — so the template reads like
 * the scene graph it produces. Everything Konva accepts goes through `config`.
 *
 * ```html
 * <xui-konva-stage [config]="{ width: 400, height: 300 }">
 *   <xui-konva-layer>
 *     <xui-konva-circle [config]="circle" (click)="onClick($event)" />
 *   </xui-konva-layer>
 * </xui-konva-stage>
 * ```
 *
 * Containers — layer, group, label — project content, and a child registers
 * with the nearest one through DI, so your own components may sit in between.
 * DOM order is mirrored onto Konva z-indices, including reorders from `@for`.
 */
@Component({
  selector:
    'xui-konva-shape, xui-konva-layer, xui-konva-fast-layer, xui-konva-group, xui-konva-label, xui-konva-rect, xui-konva-circle, xui-konva-ellipse, xui-konva-wedge, xui-konva-line, xui-konva-sprite, xui-konva-image, xui-konva-text, xui-konva-text-path, xui-konva-star, xui-konva-ring, xui-konva-arc, xui-konva-tag, xui-konva-path, xui-konva-regular-polygon, xui-konva-arrow, xui-konva-transformer',
  template: `<ng-content />`,
  host: { style: 'display: contents' },
  providers: [{ provide: XUI_KONVA_CONTAINER, useFactory: () => inject(XuiKonvaShape) }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class XuiKonvaShape implements XuiKonvaComponent, XuiKonvaContainer, XuiKonvaChild {
  readonly hostElement: HTMLElement = inject(ElementRef).nativeElement;

  /** The Konva class this tag stands for, e.g. `RegularPolygon`. */
  readonly nodeName = getNodeName(this.hostElement.localName);

  private readonly parent = inject(XUI_KONVA_CONTAINER, { skipSelf: true });
  private readonly node: Node = createNode(this.nodeName);
  private children: XuiKonvaChild[] = [];
  private cacheProps: XuiKonvaProps = {};
  private registered = false;

  /**
   * Anything the Konva node accepts. A model rather than an input: animating
   * the node with `getNode().to()` writes the final values back, so a
   * two-way binding stays in step with what is on screen.
   */
  readonly config = model<NodeConfig>();

  readonly mouseover = output<XuiKonvaEventObject<MouseEvent>>();
  readonly mousemove = output<XuiKonvaEventObject<MouseEvent>>();
  readonly mouseout = output<XuiKonvaEventObject<MouseEvent>>();
  readonly mouseenter = output<XuiKonvaEventObject<MouseEvent>>();
  readonly mouseleave = output<XuiKonvaEventObject<MouseEvent>>();
  readonly mousedown = output<XuiKonvaEventObject<MouseEvent>>();
  readonly mouseup = output<XuiKonvaEventObject<MouseEvent>>();
  readonly wheel = output<XuiKonvaEventObject<WheelEvent>>();
  readonly contextmenu = output<XuiKonvaEventObject<PointerEvent>>();
  readonly click = output<XuiKonvaEventObject<MouseEvent>>();
  readonly dblclick = output<XuiKonvaEventObject<MouseEvent>>();
  readonly touchstart = output<XuiKonvaEventObject<TouchEvent>>();
  readonly touchmove = output<XuiKonvaEventObject<TouchEvent>>();
  readonly touchend = output<XuiKonvaEventObject<TouchEvent>>();
  readonly tap = output<XuiKonvaEventObject<TouchEvent>>();
  readonly dbltap = output<XuiKonvaEventObject<TouchEvent>>();
  readonly dragstart = output<XuiKonvaEventObject<MouseEvent>>();
  readonly dragmove = output<XuiKonvaEventObject<MouseEvent>>();
  readonly dragend = output<XuiKonvaEventObject<MouseEvent>>();
  readonly transformstart = output<XuiKonvaEventObject<MouseEvent>>();
  readonly transform = output<XuiKonvaEventObject<MouseEvent>>();
  readonly transformend = output<XuiKonvaEventObject<MouseEvent>>();

  constructor() {
    this.trackAnimatedAttrs();

    inject(DestroyRef).onDestroy(() => {
      this.parent?.removeChild(this);
      this.node.destroy();
    });

    if (this.node instanceof Container) {
      // `@for` with `track` reorders host elements in place rather than
      // rebuilding them, so z-indices have to follow the DOM.
      const observer = new MutationObserver(() => this.syncChildOrderFromDom());

      observer.observe(this.hostElement, { childList: true, subtree: true });
      inject(DestroyRef).onDestroy(() => observer.disconnect());
    }
  }

  private readonly applyConfig = effect(() => {
    this.uploadKonva(this.config() ?? {});

    // Registered only once the node carries its properties, so it never draws
    // at the origin for a frame before moving into place.
    if (!this.registered && this.parent) {
      this.registered = true;
      this.parent.addChild(this);
    }
  });

  /** The underlying Konva node. */
  getStage(): Node {
    return this.node;
  }

  /** Alias of `getStage()`, for when "stage" would read as the wrong thing. */
  getNode(): Node {
    return this.node;
  }

  getConfig(): NodeConfig {
    return this.config() ?? {};
  }

  addChild(child: XuiKonvaChild): void {
    if (!(this.node instanceof Container)) {
      throw new Error(`@xui/konva: ${this.nodeName} cannot contain other nodes.`);
    }

    this.children.push(child);
    this.node.add(child.getStage() as Shape);
    this.syncZIndices();
  }

  removeChild(child: XuiKonvaChild): void {
    const index = this.children.indexOf(child);

    if (index === -1) {
      return;
    }

    this.children.splice(index, 1);
    child.getStage().remove();
    this.syncZIndices();
    updatePicture(this.node);
  }

  private uploadKonva(config: NodeConfig): void {
    const props = { ...config, ...createListener(this) };

    applyNodeProps(this, props, this.cacheProps);
    this.cacheProps = props;
  }

  private syncZIndices(): void {
    for (const [index, child] of this.children.entries()) {
      if (child.getStage().getParent()) {
        child.getStage().zIndex(index);
      }
    }
  }

  private syncChildOrderFromDom(): void {
    if (this.children.length < 2) {
      return;
    }

    const sorted = [...this.children].sort((a, b) =>
      a.hostElement.compareDocumentPosition(b.hostElement) & globalThis.Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
    );

    if (sorted.every((child, index) => child === this.children[index])) {
      return;
    }

    this.children = sorted;
    this.syncZIndices();
    updatePicture(this.node);
  }

  /**
   * `node.to()` animates attributes behind Konva's back; mirror the result
   * into `config` once the tween has settled so the binding is not stale.
   */
  private trackAnimatedAttrs(): void {
    const animate = this.node.to.bind(this.node);

    this.node.to = (params: NodeConfig): void => {
      animate(params);

      setTimeout(() => {
        if (!this.config()) {
          return;
        }

        const animated = Object.fromEntries(
          Object.entries(this.node.attrs).filter(([, value]) => typeof value !== 'function')
        );

        this.config.update(config => ({ ...config, ...animated }));
      }, ANIMATION_SETTLE_MS);
    };
  }
}

/** How long to wait for `to()` before reading the animated attributes back. */
const ANIMATION_SETTLE_MS = 200;

function createNode(nodeName: string): Node {
  const nodeClass = (Konva as unknown as Record<string, unknown>)[nodeName] as
    (new (config?: NodeConfig) => Node) | undefined;

  if (!nodeClass) {
    throw new Error(`@xui/konva: Konva has no "${nodeName}" node.`);
  }

  return new nodeClass();
}
