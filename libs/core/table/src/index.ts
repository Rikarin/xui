import { XCellDef } from './lib/cell-def';
import { XColumnDef } from './lib/column-def';
import { XFooterDef } from './lib/footer-def';
import { XHeaderDef } from './lib/header-def';
import { XPaginator } from './lib/paginator';
import { XTable } from './lib/table';

export * from './lib/cell-def';
export * from './lib/column-def';
export * from './lib/column-manager';
export * from './lib/footer-def';
export * from './lib/header-def';
export * from './lib/paginator';
export * from './lib/table';

export const XTableImports = [XCellDef, XColumnDef, XFooterDef, XHeaderDef, XTable, XPaginator] as const;
