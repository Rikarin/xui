import { XuiSplitter } from './lib/splitter';
import { XuiSplitterPanel } from './lib/splitter-panel';

export * from './lib/splitter';
export * from './lib/splitter-panel';

export const XuiSplitterImports = [XuiSplitter, XuiSplitterPanel] as const;
