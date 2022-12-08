import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'xui-footer',
  exportAs: 'xuiFooter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>'
})
export class XuiFooterComponent {}
