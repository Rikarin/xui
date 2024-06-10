import { Component } from '@angular/core';
import { Information } from '../../components/information';
import { Example } from '../../components/example';
import { Usage, Usages } from '../../components/usage';
import { HighlightModule } from 'ngx-highlightjs';
import { XuiRadioModule } from '@xui/components';

@Component({
  standalone: true,
  imports: [Information, Example, Usages, HighlightModule, XuiRadioModule],
  selector: 'app-radio',
  templateUrl: './radio.component.html',
  styleUrls: ['./radio.component.scss']
})
export class RadioComponent {
  usage: Usage[] = [
    {
      param: 'value',
      description: 'Value the radio.',
      type: 'any'
    },
    {
      param: 'color',
      description: 'Color of the radio.',
      type: '"primary" | "primary-alt" | "secondary" | "success" | "warning" | "error" | "info"',
      default: '"primary"'
    },
    {
      param: 'disabled',
      description: 'Disable the radio.',
      type: 'boolean',
      default: 'false'
    }
  ];
}
