import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-checkbox-example1',
  templateUrl: './checkbox-example1.component.html',
  styleUrls: ['./checkbox-example1.component.scss']
})
export class CheckboxExample1Component {
  checkbox = new FormControl(false);

  constructor() {
    setInterval(() => {
      this.checkbox.setValue(!this.checkbox.value);
    }, 1000);
  }
}
