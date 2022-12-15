import { ChangeDetectionStrategy, Component, ContentChildren, HostBinding, QueryList } from '@angular/core';
import { XuiSiderComponent } from './sider.component';

@Component({
  selector: 'xui-layout',
  exportAs: 'xuiLayout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>'
})
export class XuiLayoutComponent {
  @ContentChildren(XuiSiderComponent) set siders(value: QueryList<XuiSiderComponent>) {
    this.hasSider = value.length > 0;
  }

  @HostBinding('class.x-layout-sider') hasSider = false;
}
