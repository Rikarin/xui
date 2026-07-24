import { CdkContextMenuTrigger } from '@angular/cdk/menu';
import { Directive } from '@angular/core';

/**
 * Opens a menu where the user right-clicks (or long-presses) on the host.
 *
 * ```html
 * <div [xuiContextMenuTriggerFor]="menu" class="rounded border p-8">
 *   Right-click anywhere in here
 * </div>
 * <ng-template #menu>
 *   <xui-menu>
 *     <button xuiMenuItem>Cut</button>
 *     <button xuiMenuItem>Copy</button>
 *   </xui-menu>
 * </ng-template>
 * ```
 *
 * A thin alias over `CdkContextMenuTrigger`, so it reuses the very same
 * `@xui/menu` panel a click-triggered menu uses — the difference is only how it
 * opens. cdk positions the menu at the pointer and handles the nested keyboard
 * model, Escape and outside-click.
 */
@Directive({
  selector: '[xuiContextMenuTriggerFor]',
  exportAs: 'xuiContextMenuTrigger',
  hostDirectives: [
    {
      directive: CdkContextMenuTrigger,
      inputs: [
        'cdkContextMenuTriggerFor: xuiContextMenuTriggerFor',
        'cdkContextMenuPosition: xuiContextMenuPosition',
        'cdkContextMenuTriggerData: xuiContextMenuTriggerData',
        'cdkContextMenuDisabled: xuiContextMenuDisabled'
      ],
      outputs: ['cdkContextMenuOpened: contextMenuOpened', 'cdkContextMenuClosed: contextMenuClosed']
    }
  ]
})
export class XuiContextMenuTrigger {}
