import { xuiGraphEdgeMidpoint, xuiGraphEdgePath } from './node-graph.routing';
import type { XuiGraphPoint } from './node-graph.types';

const A: XuiGraphPoint = { x: 0, y: 0 };
const B: XuiGraphPoint = { x: 200, y: 100 };

/** Every `L`/`Q` vertex in a path, as `[x, y]` pairs. */
const vertices = (path: string): [number, number][] =>
  [...path.matchAll(/[MLQ]\s*(-?[\d.]+)\s+(-?[\d.]+)(?:,\s*(-?[\d.]+)\s+(-?[\d.]+))?/g)].flatMap(match => {
    const points: [number, number][] = [[+match[1], +match[2]]];

    if (match[3] !== undefined) {
      points.push([+match[3], +match[4]]);
    }

    return points;
  });

describe('xuiGraphEdgePath', () => {
  it('draws a straight route as a single line', () => {
    expect(xuiGraphEdgePath(A, 'right', B, 'left', 'straight')).toBe('M 0 0 L 200 100');
  });

  it('starts and ends a bezier exactly on the two ports', () => {
    const path = xuiGraphEdgePath(A, 'right', B, 'left', 'bezier');

    expect(path.startsWith('M 0 0')).toBe(true);
    expect(path.endsWith('200 100')).toBe(true);
  });

  it('pulls bezier control points along each port normal', () => {
    const path = xuiGraphEdgePath(A, 'right', B, 'left', 'bezier');
    const [, control1, control2] = vertices(path.replace('C', 'L'));

    // Leaving a right-hand port must set off rightwards, and arriving at a
    // left-hand port must approach from the left, whatever the geometry.
    expect(control1[0]).toBeGreaterThan(0);
    expect(control2[0]).toBeLessThan(200);
  });

  it('keeps every orthogonal segment axis-aligned', () => {
    const points = vertices(xuiGraphEdgePath(A, 'right', B, 'left', 'orthogonal'));

    for (let i = 1; i < points.length; i++) {
      const sameX = Math.abs(points[i][0] - points[i - 1][0]) < 0.01;
      const sameY = Math.abs(points[i][1] - points[i - 1][1]) < 0.01;

      expect(sameX || sameY).toBe(true);
    }
  });

  it('leaves the source along its normal before turning', () => {
    const [start, next] = vertices(xuiGraphEdgePath(A, 'right', B, 'left', 'orthogonal'));

    // The stub merges into the run that follows it when the two are collinear,
    // so what matters is the direction of the first move, not its length.
    expect(start).toEqual([0, 0]);
    expect(next[1]).toBe(0);
    expect(next[0]).toBeGreaterThan(0);
  });

  it('detours on the cross axis when the target sits behind the source', () => {
    // Target to the *left* of a right-facing source: a straight midpoint split
    // would double back through the source node.
    const points = vertices(xuiGraphEdgePath({ x: 200, y: 0 }, 'right', { x: 0, y: 120 }, 'left', 'orthogonal'));

    expect(points.every(([x]) => x <= 218)).toBe(true);
    expect(points.some(([, y]) => y > 0 && y < 120)).toBe(true);
  });

  it('rounds smoothstep corners without overshooting a short leg', () => {
    const path = xuiGraphEdgePath(A, 'right', { x: 40, y: 12 }, 'left', 'smoothstep');

    expect(path).toContain('Q');
    // A radius larger than half a leg would place a curve outside the polyline.
    expect(vertices(path).every(([x]) => x >= -0.01 && x <= 40.01)).toBe(true);
  });

  it('routes a vertical pair of ports through the cross axis', () => {
    const points = vertices(xuiGraphEdgePath(A, 'bottom', { x: 100, y: 200 }, 'top', 'orthogonal'));

    expect(points[1][0]).toBe(0);
    expect(points[1][1]).toBeGreaterThan(0);
    expect(points[points.length - 1]).toEqual([100, 200]);
  });
});

describe('xuiGraphEdgeMidpoint', () => {
  it('puts a straight label halfway between the ports', () => {
    expect(xuiGraphEdgeMidpoint(A, 'right', B, 'left', 'straight')).toEqual({ x: 100, y: 50 });
  });

  it('puts a bezier label on the curve, not on the chord', () => {
    const midpoint = xuiGraphEdgeMidpoint(A, 'right', { x: 200, y: 0 }, 'left', 'bezier');

    expect(midpoint.x).toBeCloseTo(100);
    expect(midpoint.y).toBeCloseTo(0);
  });

  it('places an orthogonal label half the total run from the source', () => {
    const midpoint = xuiGraphEdgeMidpoint(A, 'right', B, 'left', 'orthogonal');

    // Right 100, down 100, right 100 — halfway is the centre of the vertical leg.
    expect(midpoint.x).toBeCloseTo(100);
    expect(midpoint.y).toBeCloseTo(50);
  });
});
