import { XuiCaption } from './lib/caption';
import { XuiTable } from './lib/table';
import { XuiTableClasses } from './lib/table-classes';
import { XuiTd } from './lib/td';
import { XuiTh } from './lib/th';
import { XuiTr } from './lib/tr';

export * from './lib/caption';
export * from './lib/table';
export * from './lib/table-classes';
export * from './lib/td';
export * from './lib/th';
export * from './lib/tr';

export const XuiTableImports = [XuiTable, XuiTableClasses, XuiCaption, XuiTh, XuiTd, XuiTr] as const;
