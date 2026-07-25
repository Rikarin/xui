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

  mouseover?: OutputEmitterRef<XuiKonvaEventObject<MouseEvent>>;
  mousemove?: OutputEmitterRef<XuiKonvaEventObject<MouseEvent>>;
  mouseout?: OutputEmitterRef<XuiKonvaEventObject<MouseEvent>>;
  mouseenter?: OutputEmitterRef<XuiKonvaEventObject<MouseEvent>>;
  mouseleave?: OutputEmitterRef<XuiKonvaEventObject<MouseEvent>>;
  mousedown?: OutputEmitterRef<XuiKonvaEventObject<MouseEvent>>;
  mouseup?: OutputEmitterRef<XuiKonvaEventObject<MouseEvent>>;
  wheel?: OutputEmitterRef<XuiKonvaEventObject<WheelEvent>>;
  contextmenu?: OutputEmitterRef<XuiKonvaEventObject<PointerEvent>>;
  click?: OutputEmitterRef<XuiKonvaEventObject<MouseEvent>>;
  dblclick?: OutputEmitterRef<XuiKonvaEventObject<MouseEvent>>;
  touchstart?: OutputEmitterRef<XuiKonvaEventObject<TouchEvent>>;
  touchmove?: OutputEmitterRef<XuiKonvaEventObject<TouchEvent>>;
  touchend?: OutputEmitterRef<XuiKonvaEventObject<TouchEvent>>;
  tap?: OutputEmitterRef<XuiKonvaEventObject<TouchEvent>>;
  dbltap?: OutputEmitterRef<XuiKonvaEventObject<TouchEvent>>;
  dragstart?: OutputEmitterRef<XuiKonvaEventObject<MouseEvent>>;
  dragmove?: OutputEmitterRef<XuiKonvaEventObject<MouseEvent>>;
  dragend?: OutputEmitterRef<XuiKonvaEventObject<MouseEvent>>;
  transformstart?: OutputEmitterRef<XuiKonvaEventObject<MouseEvent>>;
  transform?: OutputEmitterRef<XuiKonvaEventObject<MouseEvent>>;
  transformend?: OutputEmitterRef<XuiKonvaEventObject<MouseEvent>>;
}
