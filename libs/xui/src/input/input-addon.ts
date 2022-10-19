import { ChangeDetectionStrategy, Component, Input, Optional, ViewEncapsulation } from '@angular/core';
import { InputGroupService } from './input-group.service';

@Component({
  selector: 'xui-input-addon',
  exportAs: 'xuiInputAddon',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  host: {
    '[class]': 'styles'
  }
})
export class XuiInputAddonComponent {
  @Input() color: 'light' | 'dark' = 'dark';

  get styles() {
    return `xui-input-${this.color} xui-input-${this.groupService?.size ?? 'normal'}`;
  }

  constructor(@Optional() private groupService: InputGroupService) {}
}
