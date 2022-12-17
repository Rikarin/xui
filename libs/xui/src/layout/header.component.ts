import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'xui-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>'
})
export class HeaderComponent {}
