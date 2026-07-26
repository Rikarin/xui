import type { BooleanInput } from '@angular/cdk/coercion';
import {
  type CdkColumnDef,
  CdkRowDef,
  CdkTable,
  type CdkTableDataSourceInput,
  CdkTableModule
} from '@angular/cdk/table';
import {
  ChangeDetectionStrategy,
  Component,
  type TrackByFunction,
  ViewEncapsulation,
  booleanAttribute,
  contentChildren,
  effect,
  input,
  model,
  output,
  untracked,
  viewChild
} from '@angular/core';
import { XColumnDef } from './column-def';

export type XTableDataSourceInput<T> = CdkTableDataSourceInput<T>;

@Component({
  selector: 'x-table',
  imports: [CdkTableModule],
  template: `
    <cdk-table
      #cdkTable
      [class]="tableClasses()"
      [dataSource]="dataSource()"
      [fixedLayout]="fixedLayout()"
      [multiTemplateDataRows]="multiTemplateDataRows()"
      [trackBy]="trackBy()"
      (contentChanged)="contentChanged.emit()"
    >
      <ng-content />

      <cdk-header-row [class]="headerRowClasses()" *cdkHeaderRowDef="displayedColumns(); sticky: stickyHeader()" />
      @if (!customTemplateDataRows()) {
        <cdk-row
          [tabindex]="interactiveRows() ? 0 : -1"
          [attr.role]="interactiveRows() ? 'button' : 'row'"
          [class.row-interactive]="interactiveRows()"
          (keydown.enter)="rowClick.emit(row)"
          (click)="rowClick.emit(row)"
          [class]="bodyRowClasses()"
          *cdkRowDef="let row; columns: displayedColumns()"
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
export class XTable<T> {
  private readonly cdkTable = viewChild.required('cdkTable', { read: CdkTable });

  // Cdk Table Inputs / Outputs
  readonly dataSource = input<XTableDataSourceInput<T>>([]);
  readonly fixedLayout = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly multiTemplateDataRows = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly displayedColumns = input<string[]>([]);
  // Mirrors the CDK default: without an explicit trackBy, rows are tracked by
  // item identity.
  readonly trackBy = input<TrackByFunction<T>>((_index, item) => item);

  readonly contentChanged = output<void>();

  // X Inputs / Outputs
  readonly customTemplateDataRows = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  /**
   * Marks the default body rows as clickable: they become focusable, get
   * `role="button"` and the `row-interactive` class. `rowClick` emits
   * regardless, so a listener without the visual affordance is possible —
   * but usually these two go together.
   */
  readonly interactiveRows = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly rowClick = output<T>();
  readonly stickyHeader = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  // Written both by the consumer (as inputs) and by the styled layer
  // (`XuiTableClasses` sets them directly), so they are model signals — a
  // plain field mutated after construction is invisible to zoneless OnPush
  // change detection.
  readonly tableClasses = model('');
  readonly headerRowClasses = model('');
  readonly bodyRowClasses = model('');

  readonly columnDefComponents = contentChildren(XColumnDef);
  readonly rowDefs = contentChildren(CdkRowDef);

  private readonly addedColumnDefs = new Set<CdkColumnDef>();
  private readonly addedRowDefs = new Set<CdkRowDef<T>>();

  constructor() {
    // The column/row definitions arrive through <ng-content>, which the
    // CdkTable cannot see — register them ourselves, and keep the
    // registration in sync when defs are added or removed later.
    effect(() => {
      const table = this.cdkTable();
      const columnDefs = this.columnDefComponents()
        .filter(component => component.cellDef())
        .map(component => component.columnDef());
      const rowDefs = this.rowDefs() as readonly CdkRowDef<T>[];

      untracked(() => {
        for (const def of this.addedColumnDefs) {
          if (!columnDefs.includes(def)) {
            table.removeColumnDef(def);
            this.addedColumnDefs.delete(def);
          }
        }
        for (const def of columnDefs) {
          if (!this.addedColumnDefs.has(def)) {
            table.addColumnDef(def);
            this.addedColumnDefs.add(def);
          }
        }

        for (const def of this.addedRowDefs) {
          if (!rowDefs.includes(def)) {
            table.removeRowDef(def);
            this.addedRowDefs.delete(def);
          }
        }
        for (const def of rowDefs) {
          if (!this.addedRowDefs.has(def)) {
            table.addRowDef(def);
            this.addedRowDefs.add(def);
          }
        }
      });
    });
  }
}
