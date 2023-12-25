import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Usage } from '../../components/usage';
import { FileType } from '../../components/example/example.component';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss']
})
export class CheckboxComponent {
  readonly example1 = {
    'checkbox-example1': FileType.Component
  };

  readonly example2 = {
    'checkbox-example2': FileType.Component
  };

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
}
