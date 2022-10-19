import { ChangeDetectionStrategy, Component, Input, OnChanges, ViewEncapsulation } from '@angular/core';
import { InputGroupService } from './input-group.service';

@Component({
  selector: 'xui-input-group',
  exportAs: 'xuiInputGroup',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  providers: [InputGroupService]
})
export class XuiInputGroupComponent implements OnChanges {
  @Input() xSize: 'normal' | 'small' = 'normal';

  constructor(private groupService: InputGroupService) {}

  ngOnChanges() {
    this.groupService.size = this.xSize;
  }
}
