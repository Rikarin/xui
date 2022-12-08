import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { InputGroupService } from './input-group.service';
import { InputSize } from './input.types';

@Component({
  selector: 'xui-input-group',
  exportAs: 'xuiInputGroup',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<div class="x-input-group"><ng-content></ng-content></div>',
  providers: [InputGroupService]
})
export class XuiInputGroupComponent implements OnChanges {
  @Input() size: InputSize = 'large';

  constructor(private groupService: InputGroupService) {}

  ngOnChanges() {
    this.groupService.size = this.size;
  }
}
