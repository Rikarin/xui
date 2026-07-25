import { inject, InjectionToken, ValueProvider } from '@angular/core';
import type { XuiGraphBackground, XuiGraphMarker, XuiGraphPortShape, XuiGraphRouting } from './node-graph.types';

/**
 * Presentation attached to a port *data type* — the string that decides which
 * ports may legally be wired together.
 *
 * Colouring by data type rather than by port is the whole point: in a shader or
 * VFX graph the colour is how you read compatibility at a glance, so it must be
 * declared once per type and not repeated at every call site.
 */
export interface XuiGraphPortType {
  /** Any CSS colour. Prefer a theme token so it follows light/dark. */
  color: string;

  /** Connector glyph for ports of this type. Falls back to the graph default. */
  shape?: XuiGraphPortShape;

  /** Human-readable name, used for the connector's tooltip. */
  label?: string;
}

/**
 * Application-wide defaults for the node graph.
 *
 * Provide it once at the app root to give every graph the same wiring style;
 * individual inputs still override the configured value.
 */
export interface XuiNodeGraphConfig {
  routing: XuiGraphRouting;
  background: XuiGraphBackground;
  marker: XuiGraphMarker;

  /** Spacing of the background rule and of `snapToGrid`, in graph units. */
  gridSize: number;

  /** How many minor cells make one emphasised major cell in the `grid` backdrop. */
  gridMajorEvery: number;

  snapToGrid: boolean;

  minZoom: number;
  maxZoom: number;

  /** Multiplier applied per zoom step, both for the wheel and the zoom buttons. */
  zoomStep: number;

  /** Straight run out of a port before an orthogonal wire may turn. */
  stubLength: number;

  /** Corner rounding for `smoothstep` routing. */
  cornerRadius: number;

  /** Bezier slack, as a fraction of the port separation. */
  curvature: number;

  edgeWidth: number;

  /** Connector diameter in graph units. */
  portSize: number;

  portShape: XuiGraphPortShape;

  /** Colour for a port that declares no data type, and for edges leaving one. */
  portColor: string;

  /** Data-type registry. Keys are matched against a port's `dataType`. */
  portTypes: Record<string, XuiGraphPortType>;

  /** Whether a wire may start and end on the same node. */
  allowSelfConnection: boolean;

  /**
   * Require both ends of a wire to declare the same `dataType`. A port with no
   * declared type is a wildcard and always passes.
   */
  enforcePortTypes: boolean;
}

const defaultConfig: XuiNodeGraphConfig = {
  routing: 'bezier',
  background: 'dots',
  marker: 'none',
  gridSize: 16,
  gridMajorEvery: 5,
  snapToGrid: false,
  minZoom: 0.15,
  maxZoom: 4,
  zoomStep: 1.15,
  stubLength: 18,
  cornerRadius: 8,
  curvature: 0.5,
  edgeWidth: 2,
  portSize: 11,
  portShape: 'circle',
  portColor: 'var(--color-foreground-subtle)',
  portTypes: {},
  allowSelfConnection: false,
  enforcePortTypes: true
};

const XuiNodeGraphConfigToken = new InjectionToken<XuiNodeGraphConfig>('XuiNodeGraphConfig');

export function provideXuiNodeGraphConfig(config: Partial<XuiNodeGraphConfig>): ValueProvider {
  return { provide: XuiNodeGraphConfigToken, useValue: { ...defaultConfig, ...config } };
}

export function injectXuiNodeGraphConfig(): XuiNodeGraphConfig {
  return inject(XuiNodeGraphConfigToken, { optional: true }) ?? defaultConfig;
}

/**
 * A ready-made data-type palette drawn from the categorical chart ramp, for
 * graphs that need distinguishable typed ports without designing a palette.
 *
 * ```ts
 * provideXuiNodeGraphConfig({ portTypes: { ...xuiGraphChartPortTypes(['float', 'vector', 'color']) } })
 * ```
 */
export function xuiGraphChartPortTypes(types: readonly string[]): Record<string, XuiGraphPortType> {
  return Object.fromEntries(
    types.map((type, index) => [type, { color: `var(--color-chart-${(index % 8) + 1})`, label: type }])
  );
}
