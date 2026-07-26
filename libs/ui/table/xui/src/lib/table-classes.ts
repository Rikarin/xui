import { Directive, inject } from '@angular/core';
import { XTable } from '@xui/core/table';

/**
 * Styles the headless `<x-table>` by writing the xUI Tailwind classes into its
 * `tableClasses`/`headerRowClasses`/`bodyRowClasses` model inputs:
 * `<x-table xuiTable>`. A consumer binding those inputs itself wins, since the
 * input binding is applied after this constructor runs.
 */
@Directive({ selector: '[xuiTable]' })
export class XuiTableClasses {
  constructor() {
    const table = inject(XTable, { host: true, optional: true });

    table?.tableClasses.set('flex flex-col text-sm [&_cdk-row:last-child]:border-0');
    table?.headerRowClasses.set(
      'flex min-w-[100%] w-fit border-b border-border [&.cdk-table-sticky]:bg-background ' +
        '[&.cdk-table-sticky>*]:z-[101] [&.cdk-table-sticky]:before:z-0 [&.cdk-table-sticky]:before:block [&.cdk-table-sticky]:hover:before:bg-muted/50 [&.cdk-table-sticky]:before:absolute [&.cdk-table-sticky]:before:inset-0'
    );
    table?.bodyRowClasses.set(
      'flex min-w-[100%] w-fit border-b border-border transition-[background-color] hover:bg-muted/50 [&:has([role=checkbox][aria-checked=true])]:bg-muted'
    );
  }
}
