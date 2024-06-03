import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Usage, Usages } from '../../components/usage';
import { Information } from '../../components/information';
import { Example } from '../../components/example';
import { HighlightModule } from 'ngx-highlightjs';
import { XuiToggle } from '@xui/components';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [Information, Example, Usages, HighlightModule, XuiToggle, CommonModule, ReactiveFormsModule],
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
