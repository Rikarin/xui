import { ChangeDetectionStrategy, Component, Input, OnChanges, ViewEncapsulation } from '@angular/core';
import { InputGroupService } from './input-group.service';
import { InputSize } from './input.types';

@Component({
  selector: 'xui-input-group',
  exportAs: 'xuiInputGroup',
  styleUrls: ['input-group.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<div class="input-group"><ng-content></ng-content></div>',
  providers: [InputGroupService]
})
export class XuiInputGroupComponent implements OnChanges {
  @Input() xSize: InputSize = 'normal';

  constructor(private groupService: InputGroupService) {}

  ngOnChanges() {
    this.groupService.size = this.xSize;
  }
}
