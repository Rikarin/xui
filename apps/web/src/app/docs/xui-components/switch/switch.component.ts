import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Usage, Usages } from '../../components/usage';
import { Information } from '../../components/information';
import { Example } from '../../components/example';
import { HighlightModule } from 'ngx-highlightjs';
import { XuiSwitch } from '@xui/components';

@Component({
  standalone: true,
  imports: [Information, Example, Usages, HighlightModule, XuiSwitch, ReactiveFormsModule],
  selector: 'app-switch',
  templateUrl: './switch.component.html',
  styleUrls: ['./switch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwitchComponent {
  asyncSwitch = new FormControl(false);
  disabledSwitch = new FormControl({ value: true, disabled: true });

  usage: Usage[] = [
    {
      param: 'value',
      description: 'Value the radio.',
      type: 'any'
    },
    {
      param: 'color',
      description: 'Color of the checkbox.',
      type: '"primary" | "primary-alt" | "secondary" | "success" | "warning" | "error" | "info"',
      default: '"primary"'
    },
    {
      param: 'disabled',
      description: 'Disable the checkbox.',
      type: 'boolean',
      default: 'false'
    }
  ];

  constructor() {
    setInterval(() => {
      this.asyncSwitch.setValue(!this.asyncSwitch.value);
    }, 1000);
  }
}
