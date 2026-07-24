import { CdkCellDef } from '@angular/cdk/table';
import { Directive } from '@angular/core';

@Directive({
  selector: '[xCellDef]',
  exportAs: 'xCellDef'
})
export class XCellDef extends CdkCellDef {}
