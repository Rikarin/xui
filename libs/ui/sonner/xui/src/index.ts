import { NgModule } from '@angular/core';
import { XuiSonnerComponent } from './lib/sonner.component';
export * from './lib/sonner.component';

export const XuiSonnerImports = [XuiSonnerComponent] as const;

@NgModule({
  imports: [...XuiSonnerImports],
  exports: [...XuiSonnerImports]
})
export class XuiSonnerModule {}
