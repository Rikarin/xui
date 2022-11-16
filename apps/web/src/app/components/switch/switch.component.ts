import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Usage } from '../usage';

@Component({
  selector: 'app-switch',
  templateUrl: './switch.component.html',
  styleUrls: ['./switch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwitchComponent {
  asyncSwitch = new FormControl(false);

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
      this.asyncSwitch.setValue(!this.asyncSwitch.value);
    }, 1000);
  }
}
