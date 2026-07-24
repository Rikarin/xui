import { CdkFooterCellDef } from '@angular/cdk/table';
import { Directive } from '@angular/core';

@Directive({
  selector: '[xFooterDef]',
  exportAs: 'xFooterDef'
})
export class XFooterDef extends CdkFooterCellDef {}
