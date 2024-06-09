import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Information } from '../../components/information';
import { Example } from '../../components/example';
import { HighlightModule } from 'ngx-highlightjs';
import { XuiButtonModule, XuiConfigModule, XuiIcon, XuiInputModule } from '@xui/components';
import {Usage, Usages} from "../../components/usage";

@Component({
  standalone: true,
  imports: [
    Information,
    Example,
    Usages,
    HighlightModule,
    XuiInputModule,
    XuiIcon,
    XuiButtonModule,
    XuiConfigModule,
    ReactiveFormsModule
  ],
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent {
  errorControl = new FormControl(null, Validators.required);
  errorInputControl = new FormControl(null, Validators.required);

  usage: Usage[] = [
    {
      param: 'value',
      description: 'Value the input.',
      type: 'any'
    },
    {
      param: 'color',
      description: 'Color of the input.',
      type: '"light" | "dark"',
      default: '"light"'
    },
    // TODO: type, size, placeholder
    {
      param: 'disabled',
      description: 'Disable the input.',
      type: 'boolean',
      default: 'false'
    }
  ];
}
