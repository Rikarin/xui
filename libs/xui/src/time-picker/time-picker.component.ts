import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'xui-time-picker',
  templateUrl: './time-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimePickerComponent {}
