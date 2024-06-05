import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'xui-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  host: {
    class: 'x-layout-header'
  }
})
export class XuiHeader {}
