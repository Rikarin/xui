import { Component } from '@angular/core';
import { DateTime } from 'luxon';
import { FormControl } from '@angular/forms';
import { FileType } from '../../components/example/example.component';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss']
})
export class DatePickerComponent {
  readonly example1 = {
    'date-picker-example1': FileType.Component
  };
}
