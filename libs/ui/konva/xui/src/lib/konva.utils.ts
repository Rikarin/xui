import type { KonvaEventObject, Node } from 'konva/lib/Node';
import { XUI_KONVA_EVENTS, type XuiKonvaComponent, type XuiKonvaEventObject } from './konva.types';

/** A bag of Konva attributes plus `on<event>` handlers, as applied to a node. */
export type XuiKonvaProps = Record<string, unknown>;

type XuiKonvaHandler = (event: XuiKonvaEventObject<unknown>) => void;

/** Every wrapper tag is `xui-konva-` followed by the Konva class name in kebab-case. */
export const XUI_KONVA_SELECTOR_PREFIX = 'xui-konva-';

/**
 * Turns a wrapper tag into the Konva class it stands for:
 * `xui-konva-regular-polygon` → `RegularPolygon`.
 */
export function getNodeName(tag: string): string {
  return tag
    .slice(XUI_KONVA_SELECTOR_PREFIX.length)
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/** Redraws the layer (or stage) a node lives on. A no-op while it is unparented. */
export function updatePicture(node: Node): void {
  const drawingNode = node.getLayer() ?? node.getStage();
  drawingNode?.batchDraw();
}

/**
 * Collects `on<event>` handlers for the outputs a template is actually
 * listening to, so `applyNodeProps` can bind exactly those on the Konva node.
 *
 * `listeners` is internal to `OutputEmitterRef`, but it is the only way to
 * tell a subscribed output from an idle one — and attaching all 22 events to
 * every node would cost real work on a busy stage.
 */
export function createListener(component: XuiKonvaComponent): XuiKonvaProps {
  const listeners: XuiKonvaProps = {};

  for (const eventName of XUI_KONVA_EVENTS) {
    // Typed structurally rather than as `OutputEmitterRef`, whose `listeners`
    // is private — intersecting the two collapses the type to `never`.
    const emitter = (component as unknown as Record<string, unknown>)[eventName] as
      | { listeners?: unknown[]; emit: (value: unknown) => void }
      | undefined;

    if (emitter?.listeners?.length) {
      listeners[`on${eventName}`] = emitter.emit.bind(emitter);
    }
  }

  return listeners;
}

/**
 * Applies `props` to a wrapper's Konva node, diffing against `oldProps` so
 * only what changed is written and only handlers that changed are re-bound.
 *
 * Adapted from react-konva's reconciler.
 */
export function applyNodeProps(
  component: XuiKonvaComponent,
  props: XuiKonvaProps = {},
  oldProps: XuiKonvaProps = {}
): void {
  if ('id' in props) {
    console.warn(
      '@xui/konva: setting "id" on a Konva node can collide with ids elsewhere on the page. Prefer "name".'
    );
  }

  const instance = component.getStage();
  const updatedProps: XuiKonvaProps = {};
  let hasUpdates = false;

  for (const key of Object.keys(oldProps)) {
    if (isEventProp(key)) {
      if (oldProps[key] !== props[key]) {
        instance.off(toEventName(key), oldProps[key] as XuiKonvaHandler);
      }

      continue;
    }

    if (!Object.hasOwn(props, key)) {
      instance.setAttr(key, undefined);
    }
  }

  for (const key of Object.keys(props)) {
    const changed = props[key] !== oldProps[key];

    if (isEventProp(key)) {
      if (changed && props[key]) {
        const handler = props[key] as XuiKonvaHandler;
        const eventName = toEventName(key);

        instance.off(eventName);
        instance.on(eventName, (event: KonvaEventObject<unknown>) => handler({ component, event }));
      }

      continue;
    }

    if (changed || props[key] !== instance.getAttr(key)) {
      hasUpdates = true;
      updatedProps[key] = props[key];
    }
  }

  if (!hasUpdates) {
    return;
  }

  instance.setAttrs(updatedProps);
  updatePicture(instance);

  // An image assigned before it finished loading draws as nothing; redraw once
  // the browser has the pixels.
  for (const value of Object.values(updatedProps)) {
    if (value instanceof globalThis.Image && !value.complete) {
      value.addEventListener('load', () => updatePicture(instance), { once: true });
    }
  }
}

function isEventProp(key: string): boolean {
  return key.startsWith('on');
}

/**
 * `onmouseover` → `mouseover`. Stage-only events are spelled `contentMouseover`
 * in Konva, so the capital survives the round trip.
 */
function toEventName(key: string): string {
  const name = key.slice(2).toLowerCase();

  return name.startsWith('content') ? `content${name.charAt(7).toUpperCase()}${name.slice(8)}` : name;
}
