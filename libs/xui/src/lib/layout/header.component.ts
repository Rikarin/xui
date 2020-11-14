import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'xui-header',
  exportAs: 'xuiHeader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  styleUrls: ['./header.component.scss'],
})
export class XuiHeaderComponent {}
