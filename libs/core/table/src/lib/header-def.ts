import { CdkHeaderCellDef } from '@angular/cdk/table';
import { Directive } from '@angular/core';

/**
 * The header-cell template of an `x-column-def`.
 *
 * ```html
 * <span *xHeaderDef>Name</span>
 * ```
 */
@Directive({
  selector: '[xHeaderDef]',
  exportAs: 'xHeaderDef'
})
export class XHeaderDef extends CdkHeaderCellDef {}
