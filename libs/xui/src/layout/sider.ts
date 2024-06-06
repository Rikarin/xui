import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { parseCss } from '../utils';

@Component({
  selector: 'xui-sider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  host: {
    class: 'x-layout-sider',
    '[style.width]': '_width()'
  }
})
export class XuiSider {
  width = input<string | number>('inherit');
  _width = computed(() => parseCss(this.width()));
}
