import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'xui-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  host: {
    class: 'x-layout-content'
  }
})
export class XuiContent {}
