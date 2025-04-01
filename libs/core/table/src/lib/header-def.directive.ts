import { CdkHeaderCellDef } from '@angular/cdk/table';
import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
  selector: '[xHeaderDef]',
  exportAs: 'xHeaderDef'
})
export class XHeaderDefDirective extends CdkHeaderCellDef {
  public override template: TemplateRef<unknown>;

  constructor() {
    const template = inject<TemplateRef<unknown>>(TemplateRef);

    super(template);
    this.template = template;
  }
}
