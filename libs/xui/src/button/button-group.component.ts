import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'xui-button-group',
  exportAs: 'xuiButtonGroup',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>'
})
export class XuiButtonGroupComponent {}
