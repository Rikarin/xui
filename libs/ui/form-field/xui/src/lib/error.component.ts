import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'xui-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  host: {
    class: 'block text-error text-sm font-medium'
  }
})
export class XuiErrorComponent {}
