import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Usage } from '../usage';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss']
})
export class CheckboxComponent {
  checkbox = new FormControl(false);

  usage: Usage[] = [
    {
      param: '[color]',
      description: 'Color of a checkbox',
      type: "'primary' | 'primary-alt' | 'secondary' | 'success' | 'warning' | 'error' | 'info'",
      default: 'primary'
    },
    {
      param: '[disabled]',
      description: 'Disable a checkbox',
      type: 'boolean'
    }
  ];

  constructor() {
    setInterval(() => {
      this.checkbox.setValue(!this.checkbox.value);
    }, 1000);
  }
}
