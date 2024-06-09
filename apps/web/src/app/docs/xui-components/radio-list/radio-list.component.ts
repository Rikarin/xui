import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Information } from '../../components/information';
import { Example } from '../../components/example';
import {Usage, Usages} from '../../components/usage';
import { HighlightModule } from 'ngx-highlightjs';
import { XuiRadioListModule } from '@xui/components';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [Information, Example, Usages, HighlightModule, XuiRadioListModule, ReactiveFormsModule, CommonModule],
  selector: 'app-radio-list',
  templateUrl: './radio-list.component.html',
  styleUrls: ['./radio-list.component.scss']
})
export class RadioListComponent {
  model = new FormControl('second');
  disabledModel = new FormControl({ value: 'fourth', disabled: true });
  langs = new FormControl('en_US');

  usage: Usage[] = [
    {
      param: 'value',
      description: 'Value the radio option.',
      type: 'any'
    },
    {
      param: 'color',
      description: 'Color of the radio option.',
      type: '"primary" | "primary-alt" | "secondary" | "success" | "warning" | "error" | "info"',
      default: '"primary"'
    },
    {
      param: 'disabled',
      description: 'Disable the radio option.',
      type: 'boolean',
      default: 'false'
    }
  ];
}
