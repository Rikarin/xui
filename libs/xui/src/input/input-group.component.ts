import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { INPUT_GROUP_ACCESSOR, InputGroupAccessor, InputSize } from './input.types';

@Component({
  selector: 'xui-input-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<div class="x-input-group"><ng-content></ng-content></div>',
  providers: [{ provide: INPUT_GROUP_ACCESSOR, useExisting: InputGroupComponent }]
})
export class InputGroupComponent implements InputGroupAccessor {
  @Input() size?: InputSize;

  constructor() {}
}
