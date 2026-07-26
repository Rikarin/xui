import type { ConnectedPosition } from '@angular/cdk/overlay';

/**
 * Where a connected overlay sits relative to its trigger.
 *
 * The naming follows the Floating UI / Popper convention, so `top-start` means
 * "above the trigger, aligned to its start edge". Angular CDK models the same
 * thing as four origin/overlay corner pairs; `connectedPositions` below does
 * the translation.
 */
export type XPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

export const X_PLACEMENTS: readonly XPlacement[] = [
  'top',
  'top-start',
  'top-end',
  'bottom',
  'bottom-start',
  'bottom-end',
  'left',
  'left-start',
  'left-end',
  'right',
  'right-start',
  'right-end'
];

type Side = 'top' | 'bottom' | 'left' | 'right';
type Alignment = 'start' | 'end' | undefined;

function parse(placement: XPlacement): { side: Side; alignment: Alignment } {
  const [side, alignment] = placement.split('-') as [Side, Alignment];

  return { side, alignment };
}

/** The placement that mirrors `placement` across the trigger. */
export function flipPlacement(placement: XPlacement): XPlacement {
  const opposite: Record<Side, Side> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
  const { side, alignment } = parse(placement);

  return (alignment ? `${opposite[side]}-${alignment}` : opposite[side]) as XPlacement;
}

/** The placement that keeps the side but swaps the alignment. */
export function shiftPlacement(placement: XPlacement): XPlacement {
  const { side, alignment } = parse(placement);

  if (!alignment) {
    return placement;
  }

  return `${side}-${alignment === 'start' ? 'end' : 'start'}` as XPlacement;
}

function toPosition(placement: XPlacement, offset: number): ConnectedPosition {
  const { side, alignment } = parse(placement);
  const vertical = side === 'top' || side === 'bottom';

  // Along the trigger's main axis the overlay's edge meets the trigger's
  // opposite edge; across it, the alignment decides which edges line up.
  // CDK's vertical positions are top/center/bottom but its horizontal ones are
  // start/center/end — `left`/`right` are not valid values there.
  const main = vertical
    ? { originY: side, overlayY: side === 'top' ? ('bottom' as const) : ('top' as const) }
    : side === 'left'
      ? { originX: 'start' as const, overlayX: 'end' as const }
      : { originX: 'end' as const, overlayX: 'start' as const };

  const cross = vertical
    ? {
        originX:
          alignment === 'end' ? ('end' as const) : alignment === 'start' ? ('start' as const) : ('center' as const),
        overlayX:
          alignment === 'end' ? ('end' as const) : alignment === 'start' ? ('start' as const) : ('center' as const)
      }
    : {
        originY:
          alignment === 'end' ? ('bottom' as const) : alignment === 'start' ? ('top' as const) : ('center' as const),
        overlayY:
          alignment === 'end' ? ('bottom' as const) : alignment === 'start' ? ('top' as const) : ('center' as const)
      };

  const position = { ...main, ...cross } as ConnectedPosition;

  return vertical
    ? { ...position, offsetY: side === 'top' ? -offset : offset }
    : { ...position, offsetX: side === 'left' ? -offset : offset };
}

/**
 * Build the CDK position list for a placement.
 *
 * The first entry is the requested placement; CDK falls through the rest when
 * the overlay would leave the viewport. With `flip` the fallbacks are the
 * mirrored placement, then the alignment-shifted variants of both — the same
 * order Floating UI's `flip` + `shift` middleware produce, which is the
 * behaviour a reader of that convention will expect.
 */
export function connectedPositions(placement: XPlacement, offset = 0, flip = true): ConnectedPosition[] {
  if (!flip) {
    return [toPosition(placement, offset)];
  }

  const flipped = flipPlacement(placement);
  const candidates = [placement, flipped, shiftPlacement(placement), shiftPlacement(flipped)];

  // A placement without an alignment shifts to itself; keep the list unique so
  // CDK does not evaluate the same position twice.
  return [...new Set(candidates)].map(candidate => toPosition(candidate, offset));
}
