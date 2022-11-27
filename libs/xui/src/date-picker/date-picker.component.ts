import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'xui-date-picker',
  exportAs: 'xuiDatePicker',
  styleUrls: ['./date-picker.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './date-picker.component.html'
})
export class XuiDatePickerComponent {}
