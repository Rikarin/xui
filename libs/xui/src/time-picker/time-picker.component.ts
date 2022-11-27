import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'xui-time-picker',
  exportAs: 'xuiTimePicker',
  styleUrls: ['./time-picker.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './time-picker.component.html'
})
export class XuiTimePickerComponent {}
