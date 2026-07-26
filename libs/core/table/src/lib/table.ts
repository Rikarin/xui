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

/**
 * The headless data table: a signal-based wrapper over the CDK's `cdk-table`, with no styling of its
 * own.
 *
 * ```html
 * <x-table [dataSource]="rows()" [displayedColumns]="['name', 'role']">
 *   <x-column-def name="name">
 *     <span *xHeaderDef>Name</span>
 *     <span *xCellDef="let row">{{ row.name }}</span>
 *   </x-column-def>
 * </x-table>
 * ```
 *
 * Column and row definitions arrive through `<ng-content>`, which a `CdkTable` cannot see on its own,
 * so this component registers them itself and keeps the registration in sync as defs come and go. The
 * three `…Classes` models are how a styling layer dresses it — `XuiTableClasses` writes xUI's classes
 * into them — which is why they are models rather than plain fields: a field mutated after
 * construction is invisible to zoneless OnPush.
 */
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
  /** The rows: an array, an `Observable`, or a CDK `DataSource`. */
  readonly dataSource = input<XTableDataSourceInput<T>>([]);
  /** Use `table-layout: fixed`, sizing columns from the header row alone instead of measuring every cell. */
  readonly fixedLayout = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  /** Allow more than one row template per data item, e.g. for an expandable detail row. */
  readonly multiTemplateDataRows = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  /** Which columns to render, in order, by `x-column-def` name. A defined column not listed here is not shown. */
  readonly displayedColumns = input<string[]>([]);
  // Mirrors the CDK default: without an explicit trackBy, rows are tracked by
  // item identity.
  /** How rows are tracked across data changes. Defaults to item identity, matching the CDK. */
  readonly trackBy = input<TrackByFunction<T>>((_index, item) => item);

  /** Emits after the table re-renders its rows. */
  readonly contentChanged = output<void>();

  // X Inputs / Outputs
  /**
   * Suppress the built-in body row so you can supply your own `*cdkRowDef` — for grouped, expandable or otherwise
   * non-uniform rows.
   */
  readonly customTemplateDataRows = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  /**
   * Marks the default body rows as clickable: they become focusable, get
   * `role="button"` and the `row-interactive` class. `rowClick` emits
   * regardless, so a listener without the visual affordance is possible —
   * but usually these two go together.
   */
  readonly interactiveRows = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  /**
   * Emits the clicked row. Fires on Enter too, and independently of `interactiveRows` — that input only adds the
   * affordance.
   */
  readonly rowClick = output<T>();
  /** Pin the header row while the body scrolls. */
  readonly stickyHeader = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  // Written both by the consumer (as inputs) and by the styled layer
  // (`XuiTableClasses` sets them directly), so they are model signals — a
  // plain field mutated after construction is invisible to zoneless OnPush
  // change detection.
  /** Classes for the `cdk-table` element. Written by the styling layer as well as the consumer, hence a model. */
  readonly tableClasses = model('');
  /** Classes for the header row. Written by the styling layer as well as the consumer, hence a model. */
  readonly headerRowClasses = model('');
  /** Classes for each body row. Written by the styling layer as well as the consumer, hence a model. */
  readonly bodyRowClasses = model('');

  /** The projected `x-column-def` children. Registered with the CDK table automatically. */
  readonly columnDefComponents = contentChildren(XColumnDef);
  /** Any projected `*cdkRowDef` templates, for use with `customTemplateDataRows`. */
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
