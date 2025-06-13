import { NgModule } from '@angular/core';
import { XuiSpinnerComponent } from './lib/spinner.component';
export * from './lib/spinner.component';

export const XuiSpinnerImports = [XuiSpinnerComponent] as const;

@NgModule({
  imports: [...XuiSpinnerImports],
  exports: [...XuiSpinnerImports]
})
export class XuiSpinnerModule {}
