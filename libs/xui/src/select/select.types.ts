import { InjectionToken, Signal, WritableSignal } from '@angular/core';

export type SelectSize = 'large' | 'small';
export type SelectColor = 'light' | 'dark';
export type SelectValue = string | number | null;

export interface SelectItem {
  label: string;
  value: SelectValue;
}

// This is needed to break the injection dependency between parent <-> child elements
export const XUI_SELECT_ACCESSOR = new InjectionToken<SelectAccessor>('xui-select');
export interface SelectAccessor {
  color: Signal<SelectColor>;
  _value: WritableSignal<SelectValue>;
  _viewValue: WritableSignal<string>;

  close(): void;
}
