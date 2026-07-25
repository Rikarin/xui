import { CdkMenuBar, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { computed, Directive, input } from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

/**
 * A horizontal application menu bar (File / Edit / View …). Built on
 * `@angular/cdk/menu`'s `CdkMenuBar`, so it gets roving tab focus, arrow-key
 * movement between menus, open-adjacent-on-arrow, and hover-to-switch once a
 * menu is open. Fill the dropdowns with `@xui/menu` (`<xui-menu>` /
 * `[xuiMenuItem]`).
 *
 * ```html
 * <div xuiMenubar>
 *   <button xuiMenubarTrigger [xuiMenubarTriggerFor]="file">File</button>
 * </div>
 * <ng-template #file><xui-menu><button xuiMenuItem>New</button></xui-menu></ng-template>
 * ```
 */
@Directive({
  selector: '[xuiMenubar]',
  exportAs: 'xuiMenubar',
  hostDirectives: [CdkMenuBar],
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiMenubar {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() =>
    xui('border-border bg-surface inline-flex items-center gap-0.5 rounded-md border p-1', this.class())
  );
}

/**
 * A top-level menu bar item that opens a menu. It is both a `CdkMenuItem` (so it
 * takes part in the bar's roving focus) and a `CdkMenuTrigger` (so it opens its
 * menu). Point `xuiMenubarTriggerFor` at an `<ng-template>` holding an `<xui-menu>`.
 */
@Directive({
  selector: 'button[xuiMenubarTrigger]',
  exportAs: 'xuiMenubarTrigger',
  hostDirectives: [
    CdkMenuItem,
    {
      directive: CdkMenuTrigger,
      inputs: ['cdkMenuTriggerFor: xuiMenubarTriggerFor', 'cdkMenuPosition: xuiMenubarTriggerPosition'],
      outputs: ['cdkMenuOpened: menuOpened', 'cdkMenuClosed: menuClosed']
    }
  ],
  host: {
    type: 'button',
    '[class]': 'computedClass()'
  }
})
export class XuiMenubarTrigger {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() =>
    xui(
      'text-foreground hover:bg-surface-inset flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium select-none aria-expanded:bg-surface-inset',
      // The bar's roving focus moves between items with the arrow keys, so the
      // ring is the only thing telling the user where they are. Inset so it is
      // not clipped by the bar's padding.
      'focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus',
      this.class()
    )
  );
}
