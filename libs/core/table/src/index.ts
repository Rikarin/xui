import { NgModule } from '@angular/core';
import { XCellDefDirective } from './lib/cell-def.directive';
import { XColumnDefComponent } from './lib/column-def.component';
import { XFooterDefDirective } from './lib/footer-def.directive';
import { XHeaderDefDirective } from './lib/header-def.directive';
import { XPaginatorDirective } from './lib/paginator.directive';
import { XTableComponent } from './lib/table.component';

export * from './lib/cell-def.directive';
export * from './lib/column-def.component';
export * from './lib/column-manager';
export * from './lib/footer-def.directive';
export * from './lib/header-def.directive';
export * from './lib/paginator.directive';
export * from './lib/table.component';

export const XTableImports = [
  XCellDefDirective,
  XColumnDefComponent,
  XFooterDefDirective,
  XHeaderDefDirective,
  XTableComponent,
  XPaginatorDirective
] as const;

@NgModule({
  imports: [...XTableImports],
  exports: [...XTableImports]
})
export class XTableModule {}
