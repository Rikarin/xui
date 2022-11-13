import { ChangeDetectionStrategy, Component, Input, Optional, ViewEncapsulation } from '@angular/core';
import { InputGroupService } from './input-group.service';
import { InputColor } from './input.types';

@Component({
  selector: 'xui-input-addon',
  exportAs: 'xuiInputAddon',
  styleUrls: ['input-addon.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<div [ngClass]="styles"><ng-content></ng-content></div>'
})
export class XuiInputAddonComponent {
  @Input() color: InputColor = 'dark';

  get styles() {
    return `input-addon input-addon-color-${this.color}`;
  }

  constructor(@Optional() private groupService: InputGroupService) {}
}
