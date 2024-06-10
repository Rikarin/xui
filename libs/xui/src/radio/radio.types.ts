import { InjectionToken, Signal, WritableSignal } from '@angular/core';

export type RadioValue = string | number | null;
export type RadioColor = 'primary' | 'primary-alt' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'none';

export interface RadioItem {
  label: string;
  value: RadioValue;
}

// This is needed to break the injection dependency between parent <-> child elements
export const RADIO_GROUP_ACCESSOR = new InjectionToken<RadioGroupAccessor>('xui-radio-group');

export interface RadioGroupAccessor {
  color: Signal<RadioColor>;
  value: WritableSignal<RadioValue>;
  _disabled: Signal<boolean>;
}
