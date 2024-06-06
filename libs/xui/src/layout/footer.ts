import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'xui-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  host: {
    class: 'x-layout-footer'
  }
})
export class XuiFooter {}
