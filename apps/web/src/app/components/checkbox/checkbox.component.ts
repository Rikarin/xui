import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss']
})
export class CheckboxComponent {
  checkbox = new FormControl(false);

  constructor() {
    setInterval(() => {
      this.checkbox.setValue(!this.checkbox.value);
    }, 1000);
  }
}
