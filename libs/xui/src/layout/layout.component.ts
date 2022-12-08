import { ChangeDetectionStrategy, Component, ContentChildren, QueryList } from '@angular/core';
import { XuiSiderComponent } from './sider.component';

@Component({
  selector: 'xui-layout',
  exportAs: 'xuiLayout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  host: {
    '[class.x-layout-sider]': 'siders.length > 0'
  }
})
export class XuiLayoutComponent {
  @ContentChildren(XuiSiderComponent) siders!: QueryList<XuiSiderComponent>;
}
