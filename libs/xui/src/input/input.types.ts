import { InjectionToken, Signal } from '@angular/core';

export type InputSize = 'large' | 'small';
export type InputColor = 'light' | 'dark';
export type InputType = 'text' | 'password' | 'color' | 'date' | 'email' | 'number';

export const INPUT_GROUP_ACCESSOR = new InjectionToken<InputGroupAccessor>('xui-input-group');
export interface InputGroupAccessor {
  size: Signal<InputSize | undefined>;
}
