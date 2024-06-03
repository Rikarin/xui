import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DateTime } from 'luxon';
import { XuiDatePicker } from '@xui/components';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [XuiDatePicker, CommonModule, ReactiveFormsModule],
  selector: 'app-date-picker-example1',
  templateUrl: './date-picker-example1.component.html',
  styleUrls: ['./date-picker-example1.component.scss']
})
export class DatePickerExample1Component {
  todayControl = new FormControl(DateTime.now().toISO());

  disabledBeforeToday = (current: DateTime) => {
    return current < DateTime.now();
  };
}
