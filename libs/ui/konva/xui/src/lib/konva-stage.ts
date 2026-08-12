import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  PLATFORM_ID,
  signal,
  untracked,
  viewChild,
  ViewEncapsulation
} from '@angular/core';
import type { ContainerConfig } from 'konva/lib/Container';
import { Layer } from 'konva/lib/Layer';
import type { NodeConfig } from 'konva/lib/Node';
import { Stage } from 'konva/lib/Stage';
import { XUI_KONVA_CONTAINER, type XuiKonvaChild, type XuiKonvaContainer } from './konva.token';
import { XUI_KONVA_EVENTS, XuiKonvaComponent, type XuiKonvaEventObject } from './konva.types';
import { applyNodeProps, createListener, updatePicture, type XuiKonvaProps } from './konva.utils';

/**
 * The canvas everything else is drawn on — the root of a Konva scene.
 *
 * Give it a size through `config`, then nest one or more `<xui-konva-layer>`
 * elements inside it; only layers may be direct children, which is Konva's own
 * rule rather than one this wrapper adds.
 *
 * ```html
 * <xui-konva-stage [config]="{ width: 400, height: 300 }">
 *   <xui-konva-layer>
 *     <xui-konva-rect [config]="{ x: 20, y: 20, width: 80, height: 40, fill: 'red' }" />
 *   </xui-konva-layer>
 * </xui-konva-stage>
 * ```
 *
 * Konva renders into a `div` of its own inside the host, so projected content
 * and the canvas can live side by side without Konva wiping the template.
 *
 * ## What this renders on the server
 *
 * An empty `<div>` of the declared `width` and `height`, and nothing else.
 *
 * A Konva scene is painted into a `<canvas>` by imperative calls, so there is no
 * HTML that stands for its contents — no server can produce the picture, and
 * there is nothing to describe in markup that a consumer did not already write
 * themselves. That leaves three things the response could carry: nothing, a
 * substitute for the drawing, or the space the drawing will occupy.
 *
 * It carries the space. A substitute would be a second rendering of the scene in
 * a different medium, which nothing here knows how to produce and which would go
 * stale against the canvas. Nothing at all is what the component emitted before
 * this — a stage threw in its constructor, taking itself and everything nested
 * inside it out of the response — and it costs a layout shift: the page reflows
 * the moment the canvas appears. The size is declared on `config` and is the one
 * fact about the scene the server does know, so reserving it is free and
 * correct. A stage without a declared size reserves nothing, which is the same
 * bargain the browser makes for it.
 *
 * The container is a template element rather than one prepended in the
 * constructor, so the server renders it and the client adopts the very same
 * node. Sizing it is left to Konva in the browser; the reserved size applies
 * only while there is no stage to own it.
 */
@Component({
  selector: 'xui-konva-stage',
  template: `
    <div #surface [style.width.px]="reservedSize()?.width" [style.height.px]="reservedSize()?.height"></div>
    <ng-content />
  `,
  providers: [{ provide: XUI_KONVA_CONTAINER, useFactory: () => inject(XuiKonvaStage) }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiKonvaStage implements XuiKonvaComponent, XuiKonvaContainer {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly surface = viewChild.required<ElementRef<HTMLDivElement>>('surface');
  private readonly children: XuiKonvaChild[] = [];
  private cacheProps: XuiKonvaProps = {};

  /**
   * The box the canvas will occupy, while nothing has drawn into it yet. Null in
   * the browser, where Konva sizes the container itself and two writers would
   * fight over one style.
   */
  protected readonly reservedSize = computed(() =>
    this.isBrowser ? null : { width: this.config()?.width, height: this.config()?.height }
  );

  private get container(): HTMLDivElement {
    return this.surface().nativeElement;
  }

  /**
   * Signal-backed so anything reading `getStage()` reactively re-runs the
   * moment the stage exists — it is built on the first `config`, not in the
   * constructor.
   */
  private readonly stage = signal<Stage | undefined>(undefined);

  /** Anything `Konva.Stage` accepts, most usefully `width` and `height`. */
  readonly config = input<ContainerConfig>();

  /** Emits when the pointer moves onto the stage. */
  readonly mouseover = output<XuiKonvaEventObject<MouseEvent>>();
  /** Emits when the pointer moves over the stage. */
  readonly mousemove = output<XuiKonvaEventObject<MouseEvent>>();
  /** Emits when the pointer moves off the stage. */
  readonly mouseout = output<XuiKonvaEventObject<MouseEvent>>();
  /** Emits when the pointer enters the stage, without bubbling from its children. */
  readonly mouseenter = output<XuiKonvaEventObject<MouseEvent>>();
  /** Emits when the pointer leaves the stage, without bubbling from its children. */
  readonly mouseleave = output<XuiKonvaEventObject<MouseEvent>>();
  /** Emits when a mouse button goes down on the stage. */
  readonly mousedown = output<XuiKonvaEventObject<MouseEvent>>();
  /** Emits when a mouse button comes up on the stage. */
  readonly mouseup = output<XuiKonvaEventObject<MouseEvent>>();
  /** Emits when the wheel turns over the stage. */
  readonly wheel = output<XuiKonvaEventObject<WheelEvent>>();
  /**
   * Emits when a context menu is requested on the stage. Call `preventDefault()` on the native event to suppress the
   * browser menu.
   */
  readonly contextmenu = output<XuiKonvaEventObject<PointerEvent>>();
  /** Emits when the stage is clicked. */
  readonly click = output<XuiKonvaEventObject<MouseEvent>>();
  /** Emits when the stage is double-clicked. */
  readonly dblclick = output<XuiKonvaEventObject<MouseEvent>>();
  /** Emits when a touch starts on the stage. */
  readonly touchstart = output<XuiKonvaEventObject<TouchEvent>>();
  /** Emits when a touch moves over the stage. */
  readonly touchmove = output<XuiKonvaEventObject<TouchEvent>>();
  /** Emits when a touch ends on the stage. */
  readonly touchend = output<XuiKonvaEventObject<TouchEvent>>();
  /** Emits when the stage is tapped — the touch counterpart of `click`. */
  readonly tap = output<XuiKonvaEventObject<TouchEvent>>();
  /** Emits when the stage is double-tapped. */
  readonly dbltap = output<XuiKonvaEventObject<TouchEvent>>();
  /** Emits when a drag of the stage begins. Only fires while the node is `draggable`. */
  readonly dragstart = output<XuiKonvaEventObject<MouseEvent>>();
  /** Emits when the stage moves during a drag. */
  readonly dragmove = output<XuiKonvaEventObject<MouseEvent>>();
  /** Emits when a drag of the stage ends. */
  readonly dragend = output<XuiKonvaEventObject<MouseEvent>>();
  /** Emits when a transform of the stage begins. Needs an attached Konva `Transformer`. */
  readonly transformstart = output<XuiKonvaEventObject<MouseEvent>>();
  /** Emits when the stage is scaled or rotated during a transform. */
  readonly transform = output<XuiKonvaEventObject<MouseEvent>>();
  /** Emits when a transform of the stage ends. */
  readonly transformend = output<XuiKonvaEventObject<MouseEvent>>();

  constructor() {
    if (!this.isBrowser) {
      return;
    }

    blockNativeEvents(inject(ElementRef).nativeElement);
    inject(DestroyRef).onDestroy(() => untracked(this.stage)?.destroy());
  }

  private readonly applyConfig = effect(() => {
    const config = this.config() ?? {};

    // Konva paints into a canvas, which the server has none of. Reading `config`
    // above keeps the dependency, so the stage is built on the client's first
    // run rather than waiting for the next change.
    if (!this.isBrowser) {
      return;
    }

    // Untracked: the effect writes `stage`, and depending on it would make it
    // re-run on its own write.
    if (!untracked(this.stage)) {
      this.stage.set(new Stage({ ...config, container: this.container }));
      this.uploadKonva(config);
      this.addPendingChildren();

      return;
    }

    this.uploadKonva(config);
  });

  /** The underlying `Konva.Stage`, once `config` has been applied. */
  getStage(): Stage {
    return this.stage()!;
  }

  /** Alias of `getStage()`. */
  getNode(): Stage {
    return this.stage()!;
  }

  getConfig(): NodeConfig {
    return this.config() ?? {};
  }

  addChild(child: XuiKonvaChild): void {
    if (!(child.getStage() instanceof Layer)) {
      throw new Error('@xui/konva: only layers can be added directly to a stage.');
    }

    this.children.push(child);

    const stage = untracked(this.stage);

    if (!stage) {
      // Registered before the first `config` arrived — `addPendingChildren`
      // picks it up once the stage exists.
      return;
    }

    stage.add(child.getStage() as Layer);
    this.syncZIndices();
    updatePicture(stage);
  }

  removeChild(child: XuiKonvaChild): void {
    const index = this.children.indexOf(child);

    if (index === -1) {
      return;
    }

    this.children.splice(index, 1);
    child.getStage().remove();
    this.syncZIndices();

    const stage = untracked(this.stage);

    if (stage) {
      updatePicture(stage);
    }
  }

  private addPendingChildren(): void {
    const stage = untracked(this.stage);

    if (!stage) {
      return;
    }

    for (const child of this.children) {
      stage.add(child.getStage() as Layer);
    }

    this.syncZIndices();
  }

  private syncZIndices(): void {
    for (const [index, child] of this.children.entries()) {
      if (child.getStage().getParent()) {
        child.getStage().zIndex(index);
      }
    }
  }

  private uploadKonva(config: ContainerConfig): void {
    const props = { ...config, ...createListener(this) };

    applyNodeProps(this, props, this.cacheProps);
    this.cacheProps = props;
  }
}

/**
 * Angular binds `(click)` on a component host to both the output and a native
 * DOM listener, so a click on the canvas — which lives inside the host — would
 * fire the handler twice. Refusing the native listeners leaves the outputs,
 * which Konva raises, as the single source. See angular/angular#14619.
 *
 * Only the stage needs this: shape hosts are `display: contents` wrappers that
 * never sit under the pointer.
 */
function blockNativeEvents(host: HTMLElement): void {
  const nativeEvents = new Set<string>(XUI_KONVA_EVENTS);
  const addEventListener = host.addEventListener.bind(host);

  host.addEventListener = (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) => {
    if (!nativeEvents.has(type)) {
      addEventListener(type, listener, options);
    }
  };
}
