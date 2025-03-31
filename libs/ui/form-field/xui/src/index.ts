import { NgModule } from '@angular/core';
import { XuiErrorComponent } from './lib/error.component';
import { XuiFormFieldComponent } from './lib/form-field.component';
import { XuiHintComponent } from './lib/hint.component';
export * from './lib/error.component';
export * from './lib/form-field.component';
export * from './lib/hint.component';

export const XuiFormFieldImports = [XuiFormFieldComponent, XuiErrorComponent, XuiHintComponent] as const;

@NgModule({
  imports: [...XuiFormFieldImports],
  exports: [...XuiFormFieldImports]
})
export class XuiFormFieldModule {}
