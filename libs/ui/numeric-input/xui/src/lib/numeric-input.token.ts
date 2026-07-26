import { createXConfigToken } from '@xui/core';

export type XuiNumericInputSize = 'md' | 'sm';
/** Where the stepper buttons sit. */
export type XuiNumericButtonPosition = 'right' | 'left' | 'none';

export interface XuiNumericInputConfig {
  size: XuiNumericInputSize;
  buttonPosition: XuiNumericButtonPosition;
  /** Step applied by a click or ArrowUp/Down. */
  stepSize: number;
  /** Step when Shift is held — the coarse jump. */
  majorStepSize: number;
  /** Step when Alt is held — the fine nudge. */
  minorStepSize: number;
  /** Snap an out-of-range value back into [min, max] when focus leaves. */
  clampValueOnBlur: boolean;
}

/** Application-wide defaults for XuiNumericInput. */
export const [injectXuiNumericInputConfig, provideXuiNumericInputConfig] = createXConfigToken<XuiNumericInputConfig>(
  'XuiNumericInputConfig',
  {
    size: 'md',
    buttonPosition: 'right',
    stepSize: 1,
    majorStepSize: 10,
    minorStepSize: 0.1,
    clampValueOnBlur: true
  }
);
