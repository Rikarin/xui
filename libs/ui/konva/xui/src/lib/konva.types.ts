import type { OutputEmitterRef } from '@angular/core';
import type { KonvaEventObject, Node, NodeConfig } from 'konva/lib/Node';

/**
 * The Konva events every wrapper mirrors as an Angular output.
 *
 * Only the events a template actually listens to are attached to the Konva
 * node — see `createListener` — so an idle wrapper costs nothing.
 */
export const XUI_KONVA_EVENTS = [
  'mouseover',
  'mousemove',
  'mouseout',
  'mouseenter',
  'mouseleave',
  'mousedown',
  'mouseup',
  'wheel',
  'contextmenu',
  'click',
  'dblclick',
  'touchstart',
  'touchmove',
  'touchend',
  'tap',
  'dbltap',
  'dragstart',
  'dragmove',
  'dragend',
  'transformstart',
  'transform',
  'transformend'
] as const;

/** Name of a Konva event a wrapper re-emits. */
export type XuiKonvaEvent = (typeof XUI_KONVA_EVENTS)[number];

/** Payload of every wrapper output: the Konva event plus the wrapper that raised it. */
export interface XuiKonvaEventObject<T> {
  /** The wrapper the event was raised on — reach for its node with `getNode()`. */
  component: XuiKonvaComponent;
  /** The event Konva emitted, with `target`, `evt` and friends. */
  event: KonvaEventObject<T>;
}

/**
 * The surface `XuiKonvaStage` and `XuiKonvaShape` share.
 *
 * Injected by helpers that work on either — and by anything that wants the
 * underlying Konva node of a `@ViewChild` without caring which wrapper it is.
 */
export abstract class XuiKonvaComponent {
  /** The underlying Konva node. */
  abstract getStage(): Node;
  /** Alias of `getStage()`, for when "stage" would read as the wrong thing. */
  abstract getNode(): Node;
  /** The config currently bound to the wrapper. */
  abstract getConfig(): NodeConfig;

  readonly mouseover?: OutputEmitterRef<XuiKonvaEventObject<MouseEvent>>;
  readonly mousemove?: OutputEmitterRef<XuiKonvaEventObject<MouseEvent>>;
  readonly mouseout?: OutputEmitterRef<XuiKonvaEventObject<MouseEvent>>;
  readonly mouseenter?: OutputEmitterRef<XuiKonvaEventObject<MouseEvent>>;
  readonly mouseleave?: OutputEmitterRef<XuiKonvaEventObject<MouseEvent>>;
  readonly mousedown?: OutputEmitterRef<XuiKonvaEventObject<MouseEvent>>;
  readonly mouseup?: OutputEmitterRef<XuiKonvaEventObject<MouseEvent>>;
  readonly wheel?: OutputEmitterRef<XuiKonvaEventObject<WheelEvent>>;
  readonly contextmenu?: OutputEmitterRef<XuiKonvaEventObject<PointerEvent>>;
  readonly click?: OutputEmitterRef<XuiKonvaEventObject<MouseEvent>>;
  readonly dblclick?: OutputEmitterRef<XuiKonvaEventObject<MouseEvent>>;
  readonly touchstart?: OutputEmitterRef<XuiKonvaEventObject<TouchEvent>>;
  readonly touchmove?: OutputEmitterRef<XuiKonvaEventObject<TouchEvent>>;
  readonly touchend?: OutputEmitterRef<XuiKonvaEventObject<TouchEvent>>;
  readonly tap?: OutputEmitterRef<XuiKonvaEventObject<TouchEvent>>;
  readonly dbltap?: OutputEmitterRef<XuiKonvaEventObject<TouchEvent>>;
  readonly dragstart?: OutputEmitterRef<XuiKonvaEventObject<MouseEvent>>;
  readonly dragmove?: OutputEmitterRef<XuiKonvaEventObject<MouseEvent>>;
  readonly dragend?: OutputEmitterRef<XuiKonvaEventObject<MouseEvent>>;
  readonly transformstart?: OutputEmitterRef<XuiKonvaEventObject<MouseEvent>>;
  readonly transform?: OutputEmitterRef<XuiKonvaEventObject<MouseEvent>>;
  readonly transformend?: OutputEmitterRef<XuiKonvaEventObject<MouseEvent>>;
}
