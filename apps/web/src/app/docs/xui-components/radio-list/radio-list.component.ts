import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-radio-list',
  templateUrl: './radio-list.component.html',
  styleUrls: ['./radio-list.component.scss']
})
export class RadioListComponent {
  model = new FormControl('second');
  disabledModel = new FormControl({ value: 'second', disabled: true });
  langs = new FormControl('en_US');
}
