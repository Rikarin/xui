import { InjectionToken } from '@angular/core';

export type SnackBarHorizontalPosition = 'start' | 'center' | 'end' | 'left' | 'right';
export type SnackBarVerticalPosition = 'top' | 'bottom';

export const XUI_SNACK_BAR_DATA = new InjectionToken<any>('XuiSnackBarData');
