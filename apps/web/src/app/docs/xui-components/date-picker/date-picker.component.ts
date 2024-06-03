import { Component } from '@angular/core';
import { Example, FileType } from '../../components/example';
import { Information } from '../../components/information';
import { HighlightModule } from 'ngx-highlightjs';
import { DatePickerExample1Component } from '../../../../examples/date-picker-example1/date-picker-example1.component';

@Component({
  standalone: true,
  imports: [Information, Example, HighlightModule, DatePickerExample1Component],
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss']
})
export class DatePickerComponent {
  readonly example1 = {
    'date-picker-example1': FileType.Component
  };
}
