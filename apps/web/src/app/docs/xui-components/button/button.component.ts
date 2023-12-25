import { Component } from '@angular/core';
import { delay } from '@xui/components';
import { Usage } from '../../components/usage';
import { FileType } from '../../components/example/example.component';

@Component({
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
