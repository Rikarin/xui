import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'xui-content',
  exportAs: 'xuiContent',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  styleUrls: ['./content.component.scss'],
})
export class XuiContentComponent {}
