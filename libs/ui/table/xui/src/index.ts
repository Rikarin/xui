import { NgModule } from '@angular/core';
import { XuiCaptionComponent } from './lib/caption.component';
import { XuiTableComponent } from './lib/table.component';
import { XuiTableDirective } from './lib/table.directive';
import { XuiTdComponent } from './lib/td.component';
import { XuiThComponent } from './lib/th.component';
import { XuiTrComponent } from './lib/tr.component';
export * from './lib/caption.component';
export * from './lib/table.component';
export * from './lib/table.directive';
export * from './lib/td.component';
export * from './lib/th.component';
export * from './lib/tr.component';

export const XuiTableImports = [
  XuiTableComponent,
  XuiTableDirective,
  XuiCaptionComponent,
  XuiThComponent,
  XuiTdComponent,
  XuiTrComponent
] as const;

@NgModule({
  imports: [...XuiTableImports],
  exports: [...XuiTableImports]
})
export class XuiTableModule {}
