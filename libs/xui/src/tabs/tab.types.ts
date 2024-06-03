import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { XuiTab } from './tab';

export const TAB_GROUP_ACCESSOR = new InjectionToken<TabGroupAccessor>('xui-tab-group');

export interface TabGroupAccessor {
  onChange$: Observable<unknown>;
  _active?: XuiTab;
}
