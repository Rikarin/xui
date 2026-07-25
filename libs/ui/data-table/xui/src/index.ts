import { XuiDataCell } from './lib/data-cell';
import { XuiDataTable } from './lib/data-table';
import { XuiEditableCell } from './lib/editable-cell';
import { XuiJsonFormat } from './lib/json-format';
import { XuiTruncatedFormat } from './lib/truncated-format';

export * from './lib/data-cell';
export * from './lib/data-table';
export * from './lib/data-table.types';
export * from './lib/editable-cell';
export * from './lib/json-format';
export * from './lib/truncated-format';

export const XuiDataTableImports = [
  XuiDataTable,
  XuiDataCell,
  XuiEditableCell,
  XuiTruncatedFormat,
  XuiJsonFormat
] as const;
