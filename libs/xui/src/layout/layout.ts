import { ChangeDetectionStrategy, Component, ContentChildren, HostBinding, QueryList } from '@angular/core';
import { XuiSider } from './sider';

@Component({
  selector: 'xui-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />'
})
export class XuiLayout {
  @ContentChildren(XuiSider) set siders(value: QueryList<XuiSider>) {
    this.hasSider = value.length > 0;
  }

  @HostBinding('class.x-layout')
  get hostMainClass(): boolean {
    return true;
  }

  @HostBinding('class.x-layout-has-sider') hasSider = false;
}
