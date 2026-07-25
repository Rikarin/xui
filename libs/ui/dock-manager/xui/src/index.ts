import { XuiDockContent } from './lib/dock-content';
import { XuiDockManager } from './lib/dock-manager';

export * from './lib/dock-content';
export * from './lib/dock-manager';
export * from './lib/dock-manager.types';
export * from './lib/dock-manager.utils';

export const XuiDockManagerImports = [XuiDockManager, XuiDockContent] as const;
