import { type Signal, computed, signal } from '@angular/core';

type XColumnVisibility = Record<string, boolean> | Record<string, { visible: boolean }>;

// prettier-ignore
type AllColumnsPropertyType<T> = T extends Record<string, boolean>
	? (keyof T)[]
	: T extends Record<string, infer R>
		? (R extends { visible: boolean } ? { name: keyof T } & R : never)[]
		: never;

export class XColumnManager<T extends XColumnVisibility> {
  private readonly initialColumnVisibility: T;
  private readonly _columnVisibility;

  readonly allColumns: AllColumnsPropertyType<T>;
  readonly columnVisibility;
  readonly displayedColumns: Signal<(keyof T)[]> = computed(() => {
    return Object.entries(this._columnVisibility())
      .filter(([, value]) => (typeof value === 'boolean' ? value : value.visible))
      .map(([key]) => key);
  });

  constructor(initialColumnVisibility: T) {
    this.initialColumnVisibility = initialColumnVisibility;
    this._columnVisibility = signal(this.initialColumnVisibility);
    this._columnVisibility.set(this.initialColumnVisibility);
    this.columnVisibility = this._columnVisibility.asReadonly();
    this.allColumns = this.createAllColumns(this.initialColumnVisibility);
  }

  readonly isColumnVisible = (columnName: string) => {
    const visibilityMap = this.columnVisibility();
    const columnEntry = visibilityMap[columnName];
    return typeof columnEntry === 'boolean' ? columnEntry : columnEntry.visible;
  };

  readonly isColumnDisabled = (columnName: string) =>
    this.isColumnVisible(columnName) && this.displayedColumns().length === 1;

  toggleVisibility(columnName: keyof T) {
    const visibilityMap = this._columnVisibility();
    const columnEntry = visibilityMap[columnName];
    const newVisibilityState = typeof columnEntry === 'boolean' ? !columnEntry : { visible: !columnEntry.visible };
    this._columnVisibility.set({ ...visibilityMap, [columnName]: newVisibilityState });
  }

  setVisible(columnName: keyof T) {
    const visibilityMap = this._columnVisibility();
    const columnEntry = visibilityMap[columnName];
    const newVisibilityState = typeof columnEntry === 'boolean' ? true : { visible: true };
    this._columnVisibility.set({ ...visibilityMap, [columnName]: newVisibilityState });
  }

  setInvisible(columnName: keyof T) {
    const visibilityMap = this._columnVisibility();
    const columnEntry = visibilityMap[columnName];
    const newVisibilityState = typeof columnEntry === 'boolean' ? false : { visible: false };
    this._columnVisibility.set({ ...visibilityMap, [columnName]: newVisibilityState });
  }

  private createAllColumns(initialColumnVisibility: T): AllColumnsPropertyType<T> {
    const keys = Object.keys(initialColumnVisibility) as (keyof T)[];
    if (this.isBooleanConfig(initialColumnVisibility)) {
      return keys as unknown as AllColumnsPropertyType<T>;
    }
    return keys.map(key => {
      const values = initialColumnVisibility[key] as { visible: boolean };
      return {
        name: key,
        ...values
      };
    }) as AllColumnsPropertyType<T>;
  }

  private isBooleanConfig(config: any): config is Record<string, boolean> {
    return typeof Object.values(config)[0] === 'boolean';
  }
}

export const useXColumnManager = <T extends XColumnVisibility>(initialColumnVisibility: T) =>
  new XColumnManager(initialColumnVisibility);
