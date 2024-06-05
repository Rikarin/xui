import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { INPUT_GROUP_ACCESSOR, InputGroupAccessor, InputSize } from './input.types';

@Component({
  selector: 'xui-input-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  providers: [{ provide: INPUT_GROUP_ACCESSOR, useExisting: XuiInputGroup }],
  host: {
    class: 'x-input-group'
  }
})
export class XuiInputGroup implements InputGroupAccessor {
  size = input<InputSize>();
}
