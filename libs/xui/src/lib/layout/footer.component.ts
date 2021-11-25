import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'xui-footer',
  exportAs: 'xuiFooter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  styleUrls: ['./footer.component.scss']
})
export class XuiFooterComponent {}
