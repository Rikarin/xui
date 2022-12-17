import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export type SelectSize = 'large' | 'small';
export type SelectColor = 'light' | 'dark';
export type SelectValue = string | number | null;

export interface SelectItem {
  label: string;
  value: SelectValue;
}

// This is needed to break the injection dependency between parent <-> child elements
export const SELECT_ACCESSOR = new InjectionToken<SelectAccessor>('xui-select');
export interface SelectAccessor {
  color: SelectColor;
  value: SelectValue;

  viewValue: string | undefined;
  onChange$: Observable<unknown>;

  close(): void;
}
