import { Component } from '@angular/core';
import { Usage } from '../usage';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss']
})
export class ToggleComponent {
  model = new FormControl(true);
  asyncToggle = new FormControl(false);

  usage: Usage[] = [
    {
      param: '[color]',
      description: 'Color of a toggle',
      type: "'primary' | 'primary-alt' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'none'",
      default: 'none'
    },
    {
      param: '[disabled]',
      description: 'Disable a toggle',
      type: 'boolean'
    }
  ];

  constructor() {
    setInterval(() => {
      this.asyncToggle.setValue(!this.asyncToggle.value);
    }, 1000);
  }
}
