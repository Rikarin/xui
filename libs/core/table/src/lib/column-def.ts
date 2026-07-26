import { CdkColumnDef } from '@angular/cdk/table';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, contentChild, input } from '@angular/core';
import { XCellDef } from './cell-def';
import { XFooterDef } from './footer-def';
import { XHeaderDef } from './header-def';

@Component({
  selector: 'x-column-def',
  template: `
    <ng-content select="[xHeaderDef]" />
    <ng-content select="[xCellDef]" />
    <ng-content select="[xFooterDef]" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XColumnDef {
  readonly name = input.required<string>();

  /** Extra classes the styled cells (`xui-th`/`xui-td`) merge into this column. */
  readonly class = input('');

  readonly cellDef = contentChild(XCellDef);
  private readonly footerCellDef = contentChild(XFooterDef);
  private readonly headerCellDef = contentChild(XHeaderDef);

  // Constructed directly rather than through an `ng-container [cdkColumnDef]`
  // in the template: a template-created instance has live content queries that
  // never match our projected templates, so they would keep resetting the
  // `cell`/`headerCell`/`footerCell` fields we assign below on every render
  // pass. Owning the instance makes this class the only writer. The field
  // initializer runs in the injection context, which `CdkColumnDef` needs for
  // its optional `CDK_TABLE` injection.
  private readonly _columnDef = new CdkColumnDef();

  /**
   * The CdkColumnDef with the projected cell templates wired in. Reading it
   * re-wires on demand, so it is complete before `XTable` registers it with
   * the CdkTable and stays current when the name or a template changes.
   */
  readonly columnDef = computed(() => {
    const columnDef = this._columnDef;
    columnDef.name = this.name();

    const cellDef = this.cellDef();
    if (cellDef) {
      columnDef.cell = cellDef;
    }

    const headerCellDef = this.headerCellDef();
    if (headerCellDef) {
      columnDef.headerCell = headerCellDef;
    }

    const footerCellDef = this.footerCellDef();
    if (footerCellDef) {
      columnDef.footerCell = footerCellDef;
    }

    return columnDef;
  });
}
