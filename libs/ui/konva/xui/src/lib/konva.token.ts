import { InjectionToken } from '@angular/core';
import type { Node } from 'konva/lib/Node';

/** What a container needs from a child in order to parent it. */
export interface XuiKonvaChild {
  /** The Konva node to add to the container's node. */
  getStage(): Node;
  /** The wrapper's host element, used to mirror DOM order onto Konva z-indices. */
  readonly hostElement: HTMLElement;
}

/** A wrapper that can parent other wrappers: the stage, a layer, or a group. */
export interface XuiKonvaContainer {
  addChild(child: XuiKonvaChild): void;
  removeChild(child: XuiKonvaChild): void;
}

/**
 * The nearest Konva container above a wrapper.
 *
 * Every container provides itself under this token, so a child registers with
 * its Konva parent through DI rather than content queries — which means the
 * two can sit in different templates, with any number of your own components
 * in between.
 */
export const XUI_KONVA_CONTAINER = new InjectionToken<XuiKonvaContainer | null>('XUI_KONVA_CONTAINER', {
  providedIn: 'root',
  factory: () => null
});
