import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'xui-hint',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  host: {
    class: 'block text-sm text-foreground/50'
  }
})
export class XuiHintComponent {}
