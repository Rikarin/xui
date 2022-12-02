import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'xui-time-picker',
  exportAs: 'xuiTimePicker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './time-picker.component.html'
})
export class XuiTimePickerComponent {}
