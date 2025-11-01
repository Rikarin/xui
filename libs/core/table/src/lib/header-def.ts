import { CdkHeaderCellDef } from '@angular/cdk/table';
import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
  selector: '[xHeaderDef]',
  exportAs: 'xHeaderDef'
})
export class XHeaderDef extends CdkHeaderCellDef {
  override template: TemplateRef<unknown>;

  constructor() {
    const template = inject<TemplateRef<unknown>>(TemplateRef);

    super(template);
    this.template = template;
  }
}
