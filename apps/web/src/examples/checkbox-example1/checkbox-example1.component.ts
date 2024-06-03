import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { XuiCheckbox } from '@xui/components';

@Component({
  standalone: true,
  imports: [XuiCheckbox, ReactiveFormsModule],
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
