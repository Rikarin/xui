import { ChangeDetectionStrategy, Component, ContentChildren, QueryList, ViewEncapsulation } from '@angular/core';
import { XuiSiderComponent } from './sider.component';

@Component({
  selector: 'xui-layout',
  exportAs: 'xuiLayout',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  host: {
    '[class.sider]': 'siders.length > 0'
  }
})
export class XuiLayoutComponent {
  @ContentChildren(XuiSiderComponent) siders!: QueryList<XuiSiderComponent>;
}
