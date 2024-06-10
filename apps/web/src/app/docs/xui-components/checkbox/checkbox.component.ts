import { Component } from '@angular/core';
import { Usage, Usages } from '../../components/usage';
import { Example, FileType } from '../../components/example';
import { Information } from '../../components/information';
import { HighlightModule } from 'ngx-highlightjs';
import { CheckboxExample1Component } from '../../../../examples/checkbox-example1/checkbox-example1.component';
import { CheckboxExample2Component } from '../../../../examples/checkbox-example2/checkbox-example2.component';

@Component({
  standalone: true,
  imports: [Information, Example, Usages, HighlightModule, CheckboxExample1Component, CheckboxExample2Component],
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
      param: 'value',
      description: 'Value the checkbox.',
      type: 'boolean'
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
}
