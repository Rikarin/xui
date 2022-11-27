import { Component } from '@angular/core';
import { DateTime } from 'luxon';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss']
})
export class DatePickerComponent {
  todayControl = new FormControl(DateTime.now().toISO());

  disabledBeforeToday = (current: DateTime) => {
    return current < DateTime.now();
  };
}
