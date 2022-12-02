import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'xui-content',
  exportAs: 'xuiContent',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>'
})
export class XuiContentComponent {}
