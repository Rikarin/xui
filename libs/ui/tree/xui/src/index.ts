import { XuiTree } from './lib/tree';
import { XuiTreeRouter } from './lib/tree-router';

export * from './lib/tree';
export * from './lib/tree-router';
export * from './lib/tree.types';

export const XuiTreeImports = [XuiTree, XuiTreeRouter] as const;
