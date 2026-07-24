import { X_PLACEMENTS, connectedPositions, flipPlacement, shiftPlacement, type XPlacement } from './placement';

describe('flipPlacement', () => {
  it.each([
    ['top', 'bottom'],
    ['bottom', 'top'],
    ['left', 'right'],
    ['right', 'left'],
    ['top-start', 'bottom-start'],
    ['right-end', 'left-end']
  ])('mirrors %s to %s', (from, to) => {
    expect(flipPlacement(from as XPlacement)).toBe(to);
  });

  it('is its own inverse', () => {
    for (const placement of X_PLACEMENTS) {
      expect(flipPlacement(flipPlacement(placement))).toBe(placement);
    }
  });
});

describe('shiftPlacement', () => {
  it('swaps the alignment while keeping the side', () => {
    expect(shiftPlacement('bottom-start')).toBe('bottom-end');
    expect(shiftPlacement('left-end')).toBe('left-start');
  });

  it('leaves a centred placement alone', () => {
    expect(shiftPlacement('bottom')).toBe('bottom');
  });
});

describe('connectedPositions', () => {
  it('puts a bottom-start overlay under the trigger, left edges aligned', () => {
    const [position] = connectedPositions('bottom-start', 8);

    expect(position).toMatchObject({
      originY: 'bottom',
      overlayY: 'top',
      originX: 'start',
      overlayX: 'start',
      offsetY: 8
    });
  });

  it('puts a top overlay above the trigger and offsets it upwards', () => {
    const [position] = connectedPositions('top', 8);

    expect(position).toMatchObject({ originY: 'top', overlayY: 'bottom', originX: 'center', offsetY: -8 });
  });

  it('anchors a right placement to the end edge on the horizontal axis', () => {
    const [position] = connectedPositions('right', 4);

    expect(position).toMatchObject({ originX: 'end', overlayX: 'start', originY: 'center', offsetX: 4 });
  });

  it('offsets a left placement in the negative direction', () => {
    const [position] = connectedPositions('left', 4);

    expect(position).toMatchObject({ originX: 'start', overlayX: 'end', offsetX: -4 });
  });

  it('returns only the requested position when flipping is off', () => {
    expect(connectedPositions('bottom-start', 0, false)).toHaveLength(1);
  });

  it('falls back to the mirrored placement first', () => {
    const [, fallback] = connectedPositions('bottom-start', 0);

    expect(fallback).toMatchObject({ originY: 'top', overlayY: 'bottom', originX: 'start' });
  });

  it('does not repeat a position for a centred placement', () => {
    // `bottom` shifts to itself, so the shifted candidates collapse onto the
    // originals and CDK should not be handed duplicates.
    const positions = connectedPositions('bottom', 0);

    expect(positions).toHaveLength(2);
  });

  it('offers four distinct fallbacks for an aligned placement', () => {
    expect(connectedPositions('bottom-start', 0)).toHaveLength(4);
  });

  it('produces a valid position for every placement', () => {
    for (const placement of X_PLACEMENTS) {
      const [position] = connectedPositions(placement, 6);

      expect(position.originX).toBeDefined();
      expect(position.originY).toBeDefined();
      expect(position.overlayX).toBeDefined();
      expect(position.overlayY).toBeDefined();
    }
  });
});
