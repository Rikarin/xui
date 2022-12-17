import { InjectionToken, TemplateRef } from '@angular/core';

export interface PanelBarItem {
  title: string;
  content?: any;
  // disabled?: boolean;
  // expanded: boolean;
  // focused: boolean;
  // hidden?: boolean;

  icon?: string;
  iconClass?: string;

  // id: string; // probably ARIA?
  // selected: boolean;

  children?: PanelBarItem[];
}

export const PANEL_BAR_ACCESSOR = new InjectionToken<PanelBarAccessor>('xui-panelbar');
export interface PanelBarAccessor {
  itemTemplate?: TemplateRef<unknown>;
}
