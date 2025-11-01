import { CdkCellDef } from '@angular/cdk/table';
import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
  selector: '[xCellDef]',
  exportAs: 'xCellDef'
})
export class XCellDef extends CdkCellDef {
  override template: TemplateRef<unknown>;

  constructor() {
    const template = inject<TemplateRef<unknown>>(TemplateRef);

    super(template);
    this.template = template;
  }
}
