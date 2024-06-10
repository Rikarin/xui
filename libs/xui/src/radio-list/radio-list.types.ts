import { InjectionToken, Signal, WritableSignal } from '@angular/core';

export type RadioListValue = string | number | null;
export type RadioListSize = 'sm' | 'md';
export type RadioListColor = 'light' | 'dark';

export const RADIO_LIST_ACCESSOR = new InjectionToken<RadioListAccessor>('xui-radio-list');
export interface RadioListAccessor {
  color: Signal<RadioListColor>;
  size: Signal<RadioListSize>;
  value: WritableSignal<RadioListValue>;
  _focusedValue: Signal<RadioListValue>;
  _disabled: Signal<boolean>;
}
