import { XuiTab, XuiTabTitle } from './lib/tab';
import { XuiTabs } from './lib/tabs';

export * from './lib/tab';
export * from './lib/tabs';
export * from './lib/tabs.token';

export const XuiTabsImports = [XuiTabs, XuiTab, XuiTabTitle] as const;
