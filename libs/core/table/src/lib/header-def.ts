import { CdkHeaderCellDef } from '@angular/cdk/table';
import { Directive } from '@angular/core';

@Directive({
  selector: '[xHeaderDef]',
  exportAs: 'xHeaderDef'
})
export class XHeaderDef extends CdkHeaderCellDef {}
