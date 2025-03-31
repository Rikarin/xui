import { NgModule } from '@angular/core';
import { XuiStatusComponent } from './lib/status.component';
export * from './lib/status.component';

export const XuiStatusImports = [XuiStatusComponent] as const;

@NgModule({
  imports: [...XuiStatusImports],
  exports: [...XuiStatusImports]
})
export class XuiStatusModule {}
