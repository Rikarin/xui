import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'xui-context-menu',
  exportAs: 'xuiContextMenu',
  styleUrls: ['context-menu.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  template: '<ng-content></ng-content>'
})
export class XuiContextMenuComponent {}
