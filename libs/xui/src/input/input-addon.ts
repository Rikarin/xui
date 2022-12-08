import { ChangeDetectionStrategy, Component, Input, Optional } from '@angular/core';
import { InputGroupService } from './input-group.service';
import { InputColor } from './input.types';

@Component({
  selector: 'xui-input-addon',
  exportAs: 'xuiInputAddon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<div [ngClass]="styles"><ng-content></ng-content></div>'
})
export class XuiInputAddonComponent {
  @Input() color: InputColor = 'dark';

  get styles() {
    return `x-input-addon x-input-addon-${this.color}`;
  }

  constructor(@Optional() private groupService: InputGroupService) {}
}
