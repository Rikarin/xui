import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'xui-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>'
})
export class ContentComponent {}
