import { XuiCaption } from './lib/caption';
import { XuiTable } from './lib/table';
import { XuiTableDirective } from './lib/table.directive';
import { XuiTd } from './lib/td';
import { XuiTh } from './lib/th';
import { XuiTr } from './lib/tr';

export * from './lib/caption';
export * from './lib/table';
export * from './lib/table.directive';
export * from './lib/td';
export * from './lib/th';
export * from './lib/tr';

export const XuiTableImports = [XuiTable, XuiTableDirective, XuiCaption, XuiTh, XuiTd, XuiTr] as const;
