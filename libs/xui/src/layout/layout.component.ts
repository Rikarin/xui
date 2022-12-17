import { ChangeDetectionStrategy, Component, ContentChildren, HostBinding, QueryList } from '@angular/core';
import { SiderComponent } from './sider.component';

@Component({
  selector: 'xui-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>'
})
export class LayoutComponent {
  @ContentChildren(SiderComponent) set siders(value: QueryList<SiderComponent>) {
    this.hasSider = value.length > 0;
  }

  @HostBinding('class.x-layout-sider') hasSider = false;
}
