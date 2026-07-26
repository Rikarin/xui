import { CdkCellDef } from '@angular/cdk/table';
import { Directive } from '@angular/core';

/**
 * The body-cell template of an `x-column-def`, rendered once per row.
 *
 * ```html
 * <span *xCellDef="let row">{{ row.name }}</span>
 * ```
 *
 * The CDK's `cdkCellDef` under an `x` name, so a column reads the same whichever half of the table you
 * are in.
 */
@Directive({
  selector: '[xCellDef]',
  exportAs: 'xCellDef'
})
export class XCellDef extends CdkCellDef {}
