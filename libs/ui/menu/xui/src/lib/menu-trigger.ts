import { CdkMenuTrigger } from '@angular/cdk/menu';
import { Directive } from '@angular/core';

/**
 * Opens a menu from the element it sits on.
 *
 * ```html
 * <button xuiButton [xuiMenuTriggerFor]="menu">Open</button>
 * ```
 *
 * A thin alias over `CdkMenuTrigger`, kept so xUI menus read in xUI vocabulary
 * rather than mixing `cdk*` attributes into the markup. Everything the trigger
 * does — opening in an overlay, `aria-haspopup`/`aria-expanded`, keyboard entry,
 * outside-click and Escape — is `CdkMenuTrigger`'s.
 *
 * On a plain button it opens a top-level menu; on a `[xuiMenuItem]` it makes
 * that item a submenu parent, which is how nesting is expressed.
 */
@Directive({
  selector: '[xuiMenuTriggerFor]',
  exportAs: 'xuiMenuTrigger',
  hostDirectives: [
    {
      directive: CdkMenuTrigger,
      inputs: [
        'cdkMenuTriggerFor: xuiMenuTriggerFor',
        'cdkMenuPosition: xuiMenuPosition',
        'cdkMenuTriggerData: xuiMenuTriggerData'
      ],
      outputs: ['cdkMenuOpened: menuOpened', 'cdkMenuClosed: menuClosed']
    }
  ]
})
export class XuiMenuTrigger {}
