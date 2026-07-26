import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  untracked,
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
 */
@Component({
  selector: 'xui-konva-stage',
  template: `<ng-content />`,
  providers: [{ provide: XUI_KONVA_CONTAINER, useFactory: () => inject(XuiKonvaStage) }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiKonvaStage implements XuiKonvaComponent, XuiKonvaContainer {
  private readonly container: HTMLDivElement;
  private readonly children: XuiKonvaChild[] = [];
  private cacheProps: XuiKonvaProps = {};

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
    const host: HTMLElement = inject(ElementRef).nativeElement;

    blockNativeEvents(host);

    // Konva empties whatever element it is handed, so it gets its own div and
    // the host keeps the projected `<xui-konva-layer>` elements.
    this.container = document.createElement('div');
    host.prepend(this.container);

    inject(DestroyRef).onDestroy(() => untracked(this.stage)?.destroy());
  }

  private readonly applyConfig = effect(() => {
    const config = this.config() ?? {};

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
