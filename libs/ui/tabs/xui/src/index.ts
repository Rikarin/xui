import { XuiTab, XuiTabTitle } from './lib/tab';
import { XuiTabs } from './lib/tabs';

export * from './lib/tab';
export * from './lib/tabs';

export const XuiTabsImports = [XuiTabs, XuiTab, XuiTabTitle] as const;
