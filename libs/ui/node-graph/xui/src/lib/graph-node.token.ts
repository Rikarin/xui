import { InjectionToken, type Signal } from '@angular/core';
import type { XuiGraphPortLayout, XuiGraphPortSide } from './node-graph.types';

/** The slice of a port a sibling needs in order to work out its own index. @internal */
export interface XuiGraphPortSlot {
  readonly key: string;
  readonly resolvedSide: Signal<XuiGraphPortSide>;
}

/**
 * What a port needs from the node that contains it.
 *
 * Exposed through a token rather than by injecting `XuiGraphNode` directly: the
 * node queries its ports with `contentChildren`, so a direct injection would
 * close an import cycle between the two components.
 *
 * @internal
 */
export interface XuiGraphNodeContext {
  readonly nodeId: Signal<string>;
  readonly element: HTMLElement;
  readonly portLayout: Signal<XuiGraphPortLayout>;
  readonly collapsed: Signal<boolean>;
  readonly locked: Signal<boolean>;

  /** Ports in DOM order. Drives side-relative indexing and rail spacing. */
  readonly portSlots: Signal<readonly XuiGraphPortSlot[]>;

  /**
   * Bumped whenever the node's own box changes size. Ports re-measure their
   * offset off this rather than observing themselves, because a port moves when
   * a *sibling* reflows, which no observer on the port itself would ever see.
   */
  readonly layoutEpoch: Signal<number>;
}

/** @internal */
export const XUI_GRAPH_NODE = new InjectionToken<XuiGraphNodeContext>('XuiGraphNode');
