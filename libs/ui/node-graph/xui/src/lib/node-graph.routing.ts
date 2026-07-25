import type { XuiGraphPoint, XuiGraphPortSide, XuiGraphRouting } from './node-graph.types';

/** Unit vector pointing away from the node, per port side. */
const NORMALS: Record<XuiGraphPortSide, XuiGraphPoint> = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  top: { x: 0, y: -1 },
  bottom: { x: 0, y: 1 }
};

export function xuiGraphPortNormal(side: XuiGraphPortSide): XuiGraphPoint {
  return NORMALS[side];
}

export interface XuiGraphRouteOptions {
  /**
   * How far a wire runs straight out of a port before it may turn, in graph
   * units. Keeps the first segment perpendicular to the node edge, which is what
   * makes a schematic readable.
   */
  stubLength: number;

  /** Corner rounding for `smoothstep`, in graph units. */
  cornerRadius: number;

  /**
   * Bezier control-point pull as a fraction of the port-to-port distance along
   * the port normal. `0` degenerates to a straight line; ~0.5 matches the slack
   * of a real cable.
   */
  curvature: number;
}

export const XUI_GRAPH_DEFAULT_ROUTE_OPTIONS: XuiGraphRouteOptions = {
  stubLength: 18,
  cornerRadius: 8,
  curvature: 0.5
};

/**
 * Build the `d` attribute for a wire between two ports.
 *
 * The two sides matter as much as the two points: an edge leaving a right-hand
 * port must set off rightwards even when its target sits to the left, otherwise
 * it appears to pass through the node it came from.
 */
export function xuiGraphEdgePath(
  source: XuiGraphPoint,
  sourceSide: XuiGraphPortSide,
  target: XuiGraphPoint,
  targetSide: XuiGraphPortSide,
  routing: XuiGraphRouting,
  options: XuiGraphRouteOptions = XUI_GRAPH_DEFAULT_ROUTE_OPTIONS
): string {
  switch (routing) {
    case 'straight':
      return `M ${round(source.x)} ${round(source.y)} L ${round(target.x)} ${round(target.y)}`;
    case 'orthogonal':
      return polylinePath(orthogonalPoints(source, sourceSide, target, targetSide, options.stubLength), 0);
    case 'smoothstep':
      return polylinePath(
        orthogonalPoints(source, sourceSide, target, targetSide, options.stubLength),
        options.cornerRadius
      );
    case 'bezier':
    default:
      return bezierPath(source, sourceSide, target, targetSide, options.curvature);
  }
}

/**
 * The point at the middle of a route, used to place edge labels.
 *
 * For a bezier this is the curve's t=0.5 point; for the orthogonal families it
 * is the point half the total run from the source. Picking the longest segment
 * instead would flip the label between two legs of equal length as the wire
 * moved, and the halfway point is where a reader looks anyway.
 */
export function xuiGraphEdgeMidpoint(
  source: XuiGraphPoint,
  sourceSide: XuiGraphPortSide,
  target: XuiGraphPoint,
  targetSide: XuiGraphPortSide,
  routing: XuiGraphRouting,
  options: XuiGraphRouteOptions = XUI_GRAPH_DEFAULT_ROUTE_OPTIONS
): XuiGraphPoint {
  if (routing === 'straight') {
    return { x: (source.x + target.x) / 2, y: (source.y + target.y) / 2 };
  }

  if (routing === 'bezier') {
    const [c1, c2] = bezierControlPoints(source, sourceSide, target, targetSide, options.curvature);

    // Cubic Bezier at t = 0.5 reduces to the average of the four weights 1:3:3:1.
    return {
      x: (source.x + 3 * c1.x + 3 * c2.x + target.x) / 8,
      y: (source.y + 3 * c1.y + 3 * c2.y + target.y) / 8
    };
  }

  const points = orthogonalPoints(source, sourceSide, target, targetSide, options.stubLength);
  const lengths = points.slice(1).map((point, index) => distance(points[index], point));
  const half = lengths.reduce((sum, length) => sum + length, 0) / 2;
  let travelled = 0;

  for (let i = 0; i < lengths.length; i++) {
    if (travelled + lengths[i] >= half) {
      return lerp(points[i], points[i + 1], lengths[i] === 0 ? 0 : (half - travelled) / lengths[i]);
    }

    travelled += lengths[i];
  }

  return { x: (source.x + target.x) / 2, y: (source.y + target.y) / 2 };
}

function bezierControlPoints(
  source: XuiGraphPoint,
  sourceSide: XuiGraphPortSide,
  target: XuiGraphPoint,
  targetSide: XuiGraphPortSide,
  curvature: number
): [XuiGraphPoint, XuiGraphPoint] {
  const sourceNormal = NORMALS[sourceSide];
  const targetNormal = NORMALS[targetSide];

  // Pull along each normal, scaled by the separation *on that normal's axis*.
  // A floor keeps near-coincident ports from collapsing into a straight stub,
  // which is what makes a self-connection or a tight back-link still legible.
  const dx = Math.abs(target.x - source.x);
  const dy = Math.abs(target.y - source.y);
  const sourcePull = Math.max(30, (sourceNormal.x !== 0 ? dx : dy) * curvature);
  const targetPull = Math.max(30, (targetNormal.x !== 0 ? dx : dy) * curvature);

  return [
    { x: source.x + sourceNormal.x * sourcePull, y: source.y + sourceNormal.y * sourcePull },
    { x: target.x + targetNormal.x * targetPull, y: target.y + targetNormal.y * targetPull }
  ];
}

function bezierPath(
  source: XuiGraphPoint,
  sourceSide: XuiGraphPortSide,
  target: XuiGraphPoint,
  targetSide: XuiGraphPortSide,
  curvature: number
): string {
  const [c1, c2] = bezierControlPoints(source, sourceSide, target, targetSide, curvature);

  return (
    `M ${round(source.x)} ${round(source.y)} ` +
    `C ${round(c1.x)} ${round(c1.y)}, ${round(c2.x)} ${round(c2.y)}, ${round(target.x)} ${round(target.y)}`
  );
}

/**
 * Manhattan route between two ports.
 *
 * Both ends first travel `stub` along their normal; the remaining gap is closed
 * with one or two turns. Which turn pattern applies depends on whether the two
 * normals share an axis and whether the far stub is already "ahead" of the near
 * one — when it is not, the wire has to detour on the cross axis to get around.
 */
function orthogonalPoints(
  source: XuiGraphPoint,
  sourceSide: XuiGraphPortSide,
  target: XuiGraphPoint,
  targetSide: XuiGraphPortSide,
  stub: number
): XuiGraphPoint[] {
  const sourceNormal = NORMALS[sourceSide];
  const targetNormal = NORMALS[targetSide];
  const a = { x: source.x + sourceNormal.x * stub, y: source.y + sourceNormal.y * stub };
  const b = { x: target.x + targetNormal.x * stub, y: target.y + targetNormal.y * stub };

  const sourceHorizontal = sourceNormal.x !== 0;
  const targetHorizontal = targetNormal.x !== 0;
  const middle: XuiGraphPoint[] = [];

  if (sourceHorizontal && targetHorizontal) {
    // Facing each other with room between them: split the gap and turn twice.
    const facing = sourceNormal.x !== targetNormal.x;
    const hasRoom = facing && (b.x - a.x) * sourceNormal.x > 0;

    if (hasRoom) {
      const midX = (a.x + b.x) / 2;
      middle.push({ x: midX, y: a.y }, { x: midX, y: b.y });
    } else if (facing) {
      // Facing but overlapping — go around on the cross axis.
      const midY = (a.y + b.y) / 2;
      middle.push({ x: a.x, y: midY }, { x: b.x, y: midY });
    } else {
      // Same direction — run both stubs out to the furthest of the two.
      const x = sourceNormal.x > 0 ? Math.max(a.x, b.x) : Math.min(a.x, b.x);
      middle.push({ x, y: a.y }, { x, y: b.y });
    }
  } else if (!sourceHorizontal && !targetHorizontal) {
    const facing = sourceNormal.y !== targetNormal.y;
    const hasRoom = facing && (b.y - a.y) * sourceNormal.y > 0;

    if (hasRoom) {
      const midY = (a.y + b.y) / 2;
      middle.push({ x: a.x, y: midY }, { x: b.x, y: midY });
    } else if (facing) {
      const midX = (a.x + b.x) / 2;
      middle.push({ x: midX, y: a.y }, { x: midX, y: b.y });
    } else {
      const y = sourceNormal.y > 0 ? Math.max(a.y, b.y) : Math.min(a.y, b.y);
      middle.push({ x: a.x, y }, { x: b.x, y });
    }
  } else if (sourceHorizontal) {
    // Horizontal into vertical: a single elbow, turning under/over the target.
    middle.push({ x: b.x, y: a.y });
  } else {
    middle.push({ x: a.x, y: b.y });
  }

  return simplify([source, a, ...middle, b, target]);
}

/** Drop duplicate and collinear vertices so corner rounding never sees a zero-length leg. */
function simplify(points: XuiGraphPoint[]): XuiGraphPoint[] {
  const result: XuiGraphPoint[] = [];

  for (const point of points) {
    const last = result[result.length - 1];

    if (last && Math.abs(last.x - point.x) < 0.01 && Math.abs(last.y - point.y) < 0.01) {
      continue;
    }

    const previous = result[result.length - 2];

    if (previous && last && isCollinear(previous, last, point)) {
      result[result.length - 1] = point;
      continue;
    }

    result.push(point);
  }

  return result;
}

function isCollinear(a: XuiGraphPoint, b: XuiGraphPoint, c: XuiGraphPoint): boolean {
  return (
    (Math.abs(a.x - b.x) < 0.01 && Math.abs(b.x - c.x) < 0.01) ||
    (Math.abs(a.y - b.y) < 0.01 && Math.abs(b.y - c.y) < 0.01)
  );
}

/**
 * Turn a polyline into a path, optionally rounding each interior corner.
 *
 * The rounding radius is clamped to half the shorter of the two legs meeting at
 * the corner, so a tight zig-zag degrades to sharp corners instead of producing
 * arcs that overshoot their own segments.
 */
function polylinePath(points: XuiGraphPoint[], radius: number): string {
  if (points.length === 0) {
    return '';
  }

  if (radius <= 0 || points.length < 3) {
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${round(p.x)} ${round(p.y)}`).join(' ');
  }

  let path = `M ${round(points[0].x)} ${round(points[0].y)}`;

  for (let i = 1; i < points.length - 1; i++) {
    const previous = points[i - 1];
    const corner = points[i];
    const next = points[i + 1];
    const inLength = distance(previous, corner);
    const outLength = distance(corner, next);
    const r = Math.min(radius, inLength / 2, outLength / 2);

    if (r < 0.5) {
      path += ` L ${round(corner.x)} ${round(corner.y)}`;
      continue;
    }

    const enter = lerp(corner, previous, r / inLength);
    const exit = lerp(corner, next, r / outLength);

    path += ` L ${round(enter.x)} ${round(enter.y)}`;
    path += ` Q ${round(corner.x)} ${round(corner.y)}, ${round(exit.x)} ${round(exit.y)}`;
  }

  const last = points[points.length - 1];

  return `${path} L ${round(last.x)} ${round(last.y)}`;
}

function distance(a: XuiGraphPoint, b: XuiGraphPoint): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function lerp(from: XuiGraphPoint, to: XuiGraphPoint, t: number): XuiGraphPoint {
  return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
