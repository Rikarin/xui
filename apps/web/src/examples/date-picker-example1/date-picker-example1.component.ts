import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DateTime } from 'luxon';

@Component({
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
