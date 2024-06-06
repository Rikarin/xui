import { InjectionToken, Signal } from '@angular/core';
import { Observable } from 'rxjs';
import { XuiTab } from './tab';

export const TAB_GROUP_ACCESSOR = new InjectionToken<TabGroupAccessor>('xui-tab-group');

export interface TabGroupAccessor {
  _active: Signal<XuiTab | null>;
}
