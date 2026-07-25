import { XuiDataCell } from './lib/data-cell';
import { XuiDataTable } from './lib/data-table';

export * from './lib/data-cell';
export * from './lib/data-table';
export * from './lib/data-table.types';

export const XuiDataTableImports = [XuiDataTable, XuiDataCell] as const;
