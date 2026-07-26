import { CdkFooterCellDef } from '@angular/cdk/table';
import { Directive } from '@angular/core';

/**
 * The footer-cell template of an `x-column-def`, rendered once below the body.
 *
 * ```html
 * <span *xFooterDef>Total</span>
 * ```
 */
@Directive({
  selector: '[xFooterDef]',
  exportAs: 'xFooterDef'
})
export class XFooterDef extends CdkFooterCellDef {}
