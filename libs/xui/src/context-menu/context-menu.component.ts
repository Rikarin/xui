import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'xui-context-menu',
  exportAs: 'xuiContextMenu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>'
})
export class XuiContextMenuComponent {}
