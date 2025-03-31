import { NgModule } from '@angular/core';
import { XuiInputErrorDirective } from './lib/input-error.directive';
import { XuiInputDirective } from './lib/input.directive';
export * from './lib/input-error.directive';
export * from './lib/input.directive';

export const XuiInputImports = [XuiInputDirective, XuiInputErrorDirective] as const;

@NgModule({
  imports: [...XuiInputImports],
  exports: [...XuiInputImports]
})
export class XuiInputModule {}
