import { CdkRowDef, CdkTable, type CdkTableDataSourceInput, CdkTableModule } from '@angular/cdk/table';
import {
  type AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  type QueryList,
  type TrackByFunction,
  ViewChild,
  ViewEncapsulation,
  booleanAttribute,
  model
} from '@angular/core';
import { type XTableClassesSettable, provideXTableClassesSettableExisting } from '@xui/core';
import { XColumnDef } from './column-def';

export type XTableDataSourceInput<T> = CdkTableDataSourceInput<T>;

@Component({
  selector: 'x-table',
  imports: [CdkTableModule],
  providers: [provideXTableClassesSettableExisting(<T>() => XTable<T>)],
  template: `
    <cdk-table
      #cdkTable
      [class]="tableClasses()"
      [dataSource]="dataSource"
      [fixedLayout]="fixedLayout"
      [multiTemplateDataRows]="multiTemplateDataRows"
      (contentChanged)="contentChanged.emit()"
    >
      <ng-content />

      <cdk-header-row [class]="headerRowClasses()" *cdkHeaderRowDef="displayedColumns; sticky: stickyHeader" />
      @if (!customTemplateDataRows) {
        <cdk-row
          [tabindex]="!!onRowClick ? 0 : -1"
          [attr.role]="!!onRowClick ? 'button' : 'row'"
          [class.row-interactive]="!!onRowClick"
          (keydown.enter)="!!onRowClick && onRowClick(row)"
          (click)="!!onRowClick && onRowClick(row)"
          [class]="bodyRowClasses()"
          *cdkRowDef="let row; columns: displayedColumns"
        />
      }

      <ng-template cdkNoDataRow>
        <ng-content select="[xNoDataRow]" />
      </ng-template>
    </cdk-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XTable<T> implements XTableClassesSettable, AfterContentInit {
  @ViewChild('cdkTable', { read: CdkTable, static: true })
  private readonly cdkTable?: CdkTable<T>;

  // Cdk Table Inputs / Outputs
  @Input()
  dataSource: XTableDataSourceInput<T> = [];

  @Input({ transform: booleanAttribute })
  fixedLayout = false;

  @Input({ transform: booleanAttribute })
  multiTemplateDataRows = false;

  @Input()
  displayedColumns: string[] = [];

  private _trackBy?: TrackByFunction<T>;
  get trackBy(): TrackByFunction<T> | undefined {
    return this._trackBy;
  }

  @Input()
  set trackBy(value: TrackByFunction<T>) {
    this._trackBy = value;
    if (this.cdkTable) {
      this.cdkTable.trackBy = this._trackBy;
    }
  }

  @Output()
  readonly contentChanged: EventEmitter<void> = new EventEmitter<void>();

  // X Inputs / Outputs
  @Input({ transform: booleanAttribute })
  customTemplateDataRows = false;

  @Input()
  onRowClick: ((element: T) => void) | undefined;

  @Input({ transform: booleanAttribute })
  stickyHeader = false;

  // Written both by the consumer (as inputs) and by the styled layer through
  // `setTableClasses`, so they must be signals — a plain field mutated after
  // construction is invisible to zoneless OnPush change detection.
  readonly tableClasses = model('');
  readonly headerRowClasses = model('');
  readonly bodyRowClasses = model('');

  @ContentChildren(XColumnDef) columnDefComponents!: QueryList<XColumnDef>;
  @ContentChildren(CdkRowDef) rowDefs!: QueryList<CdkRowDef<T>>;

  // after the <ng-content> has been initialized, the column definitions are available.
  // All that's left is to add them to the table ourselves:
  ngAfterContentInit(): void {
    this.columnDefComponents.forEach(component => {
      if (!this.cdkTable) return;
      if (component.cell) {
        this.cdkTable.addColumnDef(component.columnDef);
      }
    });

    this.rowDefs.forEach(rowDef => {
      if (!this.cdkTable) return;
      this.cdkTable.addRowDef(rowDef);
    });
  }

  setTableClasses({ table, headerRow, bodyRow }: Partial<{ table: string; headerRow: string; bodyRow: string }>): void {
    if (table) {
      this.tableClasses.set(table);
    }

    if (headerRow) {
      this.headerRowClasses.set(headerRow);
    }

    if (bodyRow) {
      this.bodyRowClasses.set(bodyRow);
    }
  }
}
