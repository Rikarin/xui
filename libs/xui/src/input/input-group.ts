import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { INPUT_GROUP_ACCESSOR, InputGroupAccessor, InputSize } from './input.types';

@Component({
  selector: 'xui-input-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  providers: [{ provide: INPUT_GROUP_ACCESSOR, useExisting: XuiInputGroup }]
})
export class XuiInputGroup implements InputGroupAccessor {
  @Input() size?: InputSize;

  @HostBinding('class.x-input-group')
  get hostMainClass(): boolean {
    return true;
  }
}
