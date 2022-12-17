import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'xui-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>'
})
export class FooterComponent {}
