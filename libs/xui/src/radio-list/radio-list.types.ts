import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export type RadioListValue = string | number | null;
export type RadioListSize = 'sm' | 'md';
export type RadioListColor = 'light' | 'dark';

export const RADIO_LIST_ACCESSOR = new InjectionToken<RadioListAccessor>('xui-radio-list');
export interface RadioListAccessor {
  color: RadioListColor;
  size: RadioListSize;
  value: RadioListValue;
  focusedValue?: RadioListValue;
  disabled: boolean;
  onChange$: Observable<unknown>;
}
