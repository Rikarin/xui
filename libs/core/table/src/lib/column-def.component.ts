import {
  type CdkCellDef,
  CdkColumnDef,
  type CdkFooterCellDef,
  type CdkHeaderCellDef,
  CdkTableModule
} from '@angular/cdk/table';
import {
  type AfterContentChecked,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  Input,
  ViewChild,
  ViewEncapsulation,
  input
} from '@angular/core';
import { XCellDefDirective } from './cell-def.directive';
import { XFooterDefDirective } from './footer-def.directive';
import { XHeaderDefDirective } from './header-def.directive';

@Component({
  selector: 'x-column-def',
  imports: [CdkTableModule],
  template: `
    <ng-container [cdkColumnDef]="name">
      <ng-content select="[xHeaderDef]" />
      <ng-content select="[xCellDef]" />
      <ng-content select="[xFooterDef]" />
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XColumnDefComponent implements AfterContentChecked {
  public get columnDef() {
    return this._columnDef;
  }

  public get cell() {
    return this._columnDef.cell;
  }

  private _name = '';
  @Input()
  public get name(): string {
    return this._name;
  }

  public set name(value: string) {
    this._name = value;
    if (!this._columnDef) return;
    this._columnDef.name = value;
  }

  public readonly class = input('');

  @ViewChild(CdkColumnDef, { static: true })
  private readonly _columnDef!: CdkColumnDef;

  @ContentChild(XCellDefDirective, { static: true })
  private readonly _cellDef?: CdkCellDef;

  @ContentChild(XFooterDefDirective, { static: true })
  private readonly _footerCellDef?: CdkFooterCellDef;

  @ContentChild(XHeaderDefDirective, { static: true })
  private readonly _headerCellDef?: CdkHeaderCellDef;

  public ngAfterContentChecked() {
    this._columnDef.name = this.name;

    if (this._cellDef) {
      this._columnDef.cell = this._cellDef;
    }

    if (this._headerCellDef) {
      this._columnDef.headerCell = this._headerCellDef;
    }

    if (this._footerCellDef) {
      this._columnDef.footerCell = this._footerCellDef;
    }
  }
}
