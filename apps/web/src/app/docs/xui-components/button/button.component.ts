import { Component } from '@angular/core';
import { Usage, Usages } from '../../components/usage';
import { Example, FileType } from '../../components/example';
import { Information } from '../../components/information';
import { HighlightModule } from 'ngx-highlightjs';
import { ButtonExample1Component } from '../../../../examples/button-example1/button-example1.component';
import { ButtonExample2Component } from '../../../../examples/button-example2/button-example2.component';
import { ButtonExample3Component } from '../../../../examples/button-example3/button-example3.component';
import { ButtonExample4Component } from '../../../../examples/button-example4/button-example4.component';
import { ButtonExample5Component } from '../../../../examples/button-example5/button-example5.component';

@Component({
  standalone: true,
  imports: [
    Information,
    Example,
    Usages,
    HighlightModule,
    ButtonExample1Component,
    ButtonExample2Component,
    ButtonExample3Component,
    ButtonExample4Component,
    ButtonExample5Component
  ],
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  readonly example1 = {
    'button-example1': FileType.Component
  };

  readonly example2 = {
    'button-example2': FileType.Component
  };

  readonly example3 = {
    'button-example3': FileType.Component
  };

  readonly example4 = {
    'button-example4': FileType.Component
  };

  readonly example5 = {
    'button-example5': FileType.Component
  };

  usage: Usage[] = [
    {
      param: '[size]',
      description: 'Size of a button',
      type: "'sm' | 'md' | 'lg'",
      default: 'md'
    },
    {
      param: '[type]',
      description: 'Type of a button',
      type: "'normal' | 'dashed' | 'stroked' | 'raised' | 'fab' | 'icon'",
      default: 'normal'
    },
    {
      param: '[color]',
      description: 'Color of a button',
      type: "'primary' | 'primary-alt' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'minimal",
      default: 'primary'
    },
    {
      param: '[disabled]',
      description: 'Disable a button',
      type: 'boolean'
    },
    {
      param: '(onClick)',
      description: 'Provides async way to execute an action and shows progress',
      type: '() => Promise<boolean>'
    },
    {
      param: '[stateDelay]',
      description: 'Delay for how long is async state result shown',
      type: 'number',
      default: '5000'
    },
    {
      param: '[shine]',
      description: 'Add a nice shine to the button',
      type: 'boolean'
    }
  ];
}
