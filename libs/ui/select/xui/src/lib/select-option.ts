import { Directive, inject, TemplateRef } from '@angular/core';

/** The context passed to a custom item template. */
export interface XuiSelectItemContext<T> {
  $implicit: T;
  item: T;
  active: boolean;
  selected: boolean;
  index: number;
}

/**
 * Marks an `<ng-template>` as a `xui-select` item renderer.
 *
 * ```html
 * <xui-select [items]="users">
 *   <ng-template xuiSelectOption let-user let-active="active">
 *     <div [class.font-semibold]="active">{{ user.name }}</div>
 *   </ng-template>
 * </xui-select>
 * ```
 */
@Directive({ selector: 'ng-template[xuiSelectOption]', exportAs: 'xuiSelectOption' })
export class XuiSelectOption<T = unknown> {
  readonly template = inject<TemplateRef<XuiSelectItemContext<T>>>(TemplateRef);

  // Let Angular's template type-checker infer the `let-` context types.
  static ngTemplateContextGuard<T>(_dir: XuiSelectOption<T>, _ctx: unknown): _ctx is XuiSelectItemContext<T> {
    return true;
  }
}
